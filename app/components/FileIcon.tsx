import React from 'react';
import { FileText, BookOpen, BarChart3, Download, Presentation } from 'lucide-react';

interface FileIconProps {
  fileName: string;
  fileType: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function FileIcon({ fileName, fileType, size = 'md' }: FileIconProps) {
  const ext = fileName.toLowerCase();
  
  // Size configurations
  const sizeClasses = {
    sm: { container: 'w-12 h-16', icon: 'w-4 h-4', text: 'text-[8px]' },
    md: { container: 'w-16 h-20', icon: 'w-5 h-5', text: 'text-[10px]' },
    lg: { container: 'w-24 h-32', icon: 'w-8 h-8', text: 'text-xs' },
  };
  
  const { container, icon: iconSize, text: textSize } = sizeClasses[size];
  
  // Get file type configuration
  const getFileConfig = () => {
    // EPUB - Purple
    if (fileType.includes("epub") || ext.endsWith(".epub")) {
      return {
        bgGradient: 'from-[#667eea] to-[#764ba2]',
        iconColor: '#667eea',
        textColor: 'text-[#667eea]',
        extension: 'EPUB',
        icon: <BookOpen className={iconSize} style={{ color: '#667eea' }} />,
      };
    }
    
    // DOC - Dark Blue
    if (ext.endsWith(".doc")) {
      return {
        bgGradient: 'from-[#2b5797] to-[#1e3a5f]',
        iconColor: '#2b5797',
        textColor: 'text-[#2b5797]',
        extension: 'DOC',
        icon: <FileText className={iconSize} style={{ color: '#2b5797' }} />,
      };
    }
    
    // DOCX - Light Blue
    if (ext.endsWith(".docx") || fileType.includes("wordprocessingml")) {
      return {
        bgGradient: 'from-[#2196F3] to-[#1976D2]',
        iconColor: '#2196F3',
        textColor: 'text-[#2196F3]',
        extension: 'DOCX',
        icon: <FileText className={iconSize} style={{ color: '#2196F3' }} />,
      };
    }
    
    // XLS - Dark Green
    if (ext.endsWith(".xls")) {
      return {
        bgGradient: 'from-[#1d6f42] to-[#0d5c29]',
        iconColor: '#1d6f42',
        textColor: 'text-[#1d6f42]',
        extension: 'XLS',
        icon: <BarChart3 className={iconSize} style={{ color: '#1d6f42' }} />,
      };
    }
    
    // XLSX - Light Green
    if (ext.endsWith(".xlsx") || fileType.includes("spreadsheetml")) {
      return {
        bgGradient: 'from-[#4CAF50] to-[#388E3C]',
        iconColor: '#4CAF50',
        textColor: 'text-[#4CAF50]',
        extension: 'XLSX',
        icon: <BarChart3 className={iconSize} style={{ color: '#4CAF50' }} />,
      };
    }
    
    // PPT - Dark Orange
    if (ext.endsWith(".ppt")) {
      return {
        bgGradient: 'from-[#D84315] to-[#BF360C]',
        iconColor: '#D84315',
        textColor: 'text-[#D84315]',
        extension: 'PPT',
        icon: <Presentation className={iconSize} style={{ color: '#D84315' }} />,
      };
    }
    
    // PPTX - Light Orange
    if (ext.endsWith(".pptx") || fileType.includes("presentationml")) {
      return {
        bgGradient: 'from-[#FF5722] to-[#E64A19]',
        iconColor: '#FF5722',
        textColor: 'text-[#FF5722]',
        extension: 'PPTX',
        icon: <Presentation className={iconSize} style={{ color: '#FF5722' }} />,
      };
    }
    
    // TXT - Gray
    if (ext.endsWith(".txt") || fileType.includes("text/plain")) {
      return {
        bgGradient: 'from-[#757575] to-[#424242]',
        iconColor: '#757575',
        textColor: 'text-[#757575]',
        extension: 'TXT',
        icon: <FileText className={iconSize} style={{ color: '#757575' }} />,
      };
    }
    
    // MD - Orange
    if (ext.endsWith(".md") || ext.endsWith(".markdown")) {
      return {
        bgGradient: 'from-[#FF6F00] to-[#E65100]',
        iconColor: '#FF6F00',
        textColor: 'text-[#FF6F00]',
        extension: 'MD',
        icon: <Download className={iconSize} style={{ color: '#FF6F00' }} />,
      };
    }
    
    // MINDMAP - Teal (Mind Map)
    if (ext.endsWith(".mindmap") || ext.endsWith(".map")) {
      return {
        bgGradient: 'from-[#00ACC1] to-[#00838F]',
        iconColor: '#00ACC1',
        textColor: 'text-[#00ACC1]',
        extension: 'MAP',
        icon: (
          <svg className={iconSize} viewBox="0 0 60 60" style={{ color: '#00ACC1' }}>
            <circle cx="30" cy="30" r="8" fill="#00ACC1" stroke="#00838F" strokeWidth="2"/>
            <line x1="30" y1="30" x2="15" y2="45" stroke="#00ACC1" strokeWidth="2"/>
            <line x1="30" y1="30" x2="45" y2="45" stroke="#00ACC1" strokeWidth="2"/>
            <circle cx="15" cy="15" r="5" fill="#00ACC1" stroke="#00838F" strokeWidth="1.5"/>
            <circle cx="45" cy="15" r="5" fill="#00ACC1" stroke="#00838F" strokeWidth="1.5"/>
            <circle cx="15" cy="45" r="5" fill="#00ACC1" stroke="#00838F" strokeWidth="1.5"/>
            <circle cx="45" cy="45" r="5" fill="#00ACC1" stroke="#00838F" strokeWidth="1.5"/>
            <line x1="15" y1="15" x2="8" y2="8" stroke="#00ACC1" strokeWidth="1.5"/>
            <line x1="45" y1="15" x2="52" y2="8" stroke="#00ACC1" strokeWidth="1.5"/>
            <circle cx="8" cy="8" r="3" fill="#00ACC1"/>
            <circle cx="52" cy="8" r="3" fill="#00ACC1"/>
          </svg>
        ),
      };
    }
    
    // Default - Gray
    return {
      bgGradient: 'from-gray-400 to-gray-600',
      iconColor: '#757575',
      textColor: 'text-gray-600',
      extension: ext.split('.').pop()?.toUpperCase().slice(0, 4) || 'FILE',
      icon: <FileText className={iconSize} style={{ color: '#757575' }} />,
    };
  };
  
  const config = getFileConfig();
  
  return (
    <div className="relative flex flex-col items-center">
      {/* File card container */}
      <div className={`${container} relative bg-white rounded-lg shadow-md overflow-hidden`}>
        {/* Colored header gradient */}
        <div className={`absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-br ${config.bgGradient}`} />
        
        {/* Folded corner effect */}
        <div 
          className="absolute top-0 right-0 w-0 h-0"
          style={{
            borderStyle: 'solid',
            borderWidth: '0 12px 12px 0',
            borderColor: `transparent ${config.iconColor} transparent transparent`,
          }}
        />
        
        {/* Icon in center */}
        <div className="relative h-full flex items-center justify-center">
          {config.icon}
        </div>
      </div>
      
      {/* Extension label below */}
      <div className={`mt-1 font-bold ${config.textColor} ${textSize} uppercase`}>
        .{config.extension}
      </div>
    </div>
  );
}
