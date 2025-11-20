/**
 * Background Upload Queue System
 * Handles UploadThing uploads in the background without blocking UI
 */

interface UploadTask {
  id: string;
  file: File;
  folderId?: string | null;
  onProgress?: (progress: number) => void;
  onComplete?: (result: Record<string, unknown>) => void;
  onError?: (error: Error) => void;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  progress: number;
  result?: Record<string, unknown>;
  error?: Error;
}

class UploadQueue {
  private queue: UploadTask[] = [];
  private activeUploads: Map<string, UploadTask> = new Map();
  private completedTasks: Map<string, UploadTask> = new Map(); // Track completed tasks
  private maxConcurrent = 3; // Upload 3 files at a time
  private listeners: Set<(tasks: UploadTask[]) => void> = new Set();

  /**
   * Add a file to the upload queue
   */
  addUpload(file: File, folderId?: string | null): string {
    const taskId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const task: UploadTask = {
      id: taskId,
      file,
      folderId,
      status: 'pending',
      progress: 0,
    };

    this.queue.push(task);
    this.notifyListeners();
    this.processQueue();
    
    return taskId;
  }

  /**
   * Add multiple files to the queue
   */
  addBulkUpload(files: File[], folderId?: string | null): string[] {
    const taskIds: string[] = [];
    
    for (const file of files) {
      const taskId = this.addUpload(file, folderId);
      taskIds.push(taskId);
    }
    
    return taskIds;
  }

  /**
   * Process the upload queue
   */
  private async processQueue() {
    // Check if we can start more uploads
    while (this.activeUploads.size < this.maxConcurrent && this.queue.length > 0) {
      const task = this.queue.shift();
      if (!task) break;

      this.activeUploads.set(task.id, task);
      task.status = 'uploading';
      this.notifyListeners();

      // Start upload in background
      this.uploadFile(task);
    }
  }

  /**
   * Upload a single file
   */
  private async uploadFile(task: UploadTask) {
    try {
      const formData = new FormData();
      formData.append('files', task.file);
      if (task.folderId) {
        formData.append('folderId', task.folderId);
      }

      // Use the folder import API so uploads are stored with the correct folder_id
      const response = await fetch('/api/import/folder', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      task.status = 'completed';
      task.progress = 100;
      task.result = result;
      
      if (task.onComplete) {
        task.onComplete(result);
      }
    } catch (error) {
      task.status = 'failed';
      task.error = error as Error;
      
      if (task.onError) {
        task.onError(error as Error);
      }
    } finally {
      // Ensure task status is set (fallback)
      if (task.status === 'uploading') {
        task.status = 'failed';
      }
      
      // Move completed/failed tasks to completedTasks map
      this.completedTasks.set(task.id, task);
      this.activeUploads.delete(task.id);
      
      console.log(`Upload task ${task.id} finished with status: ${task.status}`);
      this.notifyListeners();
      this.processQueue(); // Process next in queue
    }
  }

  /**
   * Get all tasks (active, queued, and completed)
   */
  getAllTasks(): UploadTask[] {
    return [
      ...Array.from(this.activeUploads.values()),
      ...this.queue,
      ...Array.from(this.completedTasks.values()),
    ];
  }

  /**
   * Get task by ID
   */
  getTask(taskId: string): UploadTask | undefined {
    return this.activeUploads.get(taskId) || 
           this.queue.find(t => t.id === taskId) || 
           this.completedTasks.get(taskId);
  }

  /**
   * Subscribe to queue updates
   */
  subscribe(listener: (tasks: UploadTask[]) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of queue changes
   */
  private notifyListeners() {
    const tasks = this.getAllTasks();
    this.listeners.forEach(listener => listener(tasks));
  }

  /**
   * Get queue statistics
   */
  getStats() {
    const tasks = this.getAllTasks();
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      uploading: tasks.filter(t => t.status === 'uploading').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      failed: tasks.filter(t => t.status === 'failed').length,
    };
  }

  /**
   * Clear completed tasks
   */
  clearCompleted() {
    // Clear completed tasks from the completed tasks map
    this.completedTasks.clear();
    this.notifyListeners();
  }

  /**
   * Check if specific tasks are all completed
   */
  areTasksCompleted(taskIds: string[]): boolean {
    const results = taskIds.map(id => {
      const task = this.getTask(id);
      const isCompleted = task && (task.status === 'completed' || task.status === 'failed');
      console.log(`Task ${id}: status=${task?.status || 'not found'}, completed=${isCompleted}`);
      return isCompleted;
    });
    
    const allCompleted = results.every(Boolean);
    console.log(`areTasksCompleted: ${results.filter(Boolean).length}/${taskIds.length} completed, result=${allCompleted}`);
    return allCompleted;
  }

  /**
   * Debug method to log current queue state
   */
  debugQueueState() {
    console.log('=== Upload Queue Debug ===');
    console.log('Active uploads:', this.activeUploads.size);
    console.log('Queued tasks:', this.queue.length);
    console.log('Completed tasks:', this.completedTasks.size);
    
    console.log('Active tasks:');
    this.activeUploads.forEach((task, id) => {
      console.log(`  ${id}: ${task.status} (${task.progress}%)`);
    });
    
    console.log('Completed tasks:');
    this.completedTasks.forEach((task, id) => {
      console.log(`  ${id}: ${task.status}`);
    });
    console.log('========================');
  }

  /**
   * Retry failed uploads
   */
  retryFailed() {
    const failedTasks = Array.from(this.completedTasks.values())
      .filter(t => t.status === 'failed');
    
    for (const task of failedTasks) {
      this.completedTasks.delete(task.id);
      task.status = 'pending';
      task.progress = 0;
      task.error = undefined;
      this.queue.push(task);
    }
    
    this.notifyListeners();
    this.processQueue();
  }
}

// Singleton instance
export const uploadQueue = new UploadQueue();
