--
-- PostgreSQL database dump
--

\restrict JYy8ZNRx95ZFSLHbM4tjyvc8mF657jwmCtmVJRXOU7a4TOaLG5uoNXLA2wKM3S7

-- Dumped from database version 17.6 (Ubuntu 17.6-0ubuntu0.25.04.1)
-- Dumped by pg_dump version 17.6 (Ubuntu 17.6-0ubuntu0.25.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: folders; Type: TABLE; Schema: public; Owner: kan_user
--

CREATE TABLE public.folders (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    parent_id character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    color character varying(50) DEFAULT 'blue'::character varying
);


ALTER TABLE public.folders OWNER TO kan_user;

--
-- Name: uploads; Type: TABLE; Schema: public; Owner: kan_user
--

CREATE TABLE public.uploads (
    id character varying(255) NOT NULL,
    name character varying(500) NOT NULL,
    url text NOT NULL,
    file_type character varying(100) NOT NULL,
    file_size integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    folder_id character varying(255),
    tags text[]
);


ALTER TABLE public.uploads OWNER TO kan_user;

--
-- Data for Name: folders; Type: TABLE DATA; Schema: public; Owner: kan_user
--

COPY public.folders (id, name, parent_id, created_at, updated_at, color) FROM stdin;
\.


--
-- Data for Name: uploads; Type: TABLE DATA; Schema: public; Owner: kan_user
--

COPY public.uploads (id, name, url, file_type, file_size, created_at, folder_id, tags) FROM stdin;
upload_1763330232655_m4qd1a	exact text.txt	https://utfs.io/f/oaZdyPMgC4yp74NZsirG1oKnzO4faejlI086UHb2hBZyskwX	text/plain	17304	2025-11-16 21:57:12.681648	\N	{}
\.


--
-- Name: folders folders_pkey; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.folders
    ADD CONSTRAINT folders_pkey PRIMARY KEY (id);


--
-- Name: uploads uploads_pkey; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.uploads
    ADD CONSTRAINT uploads_pkey PRIMARY KEY (id);


--
-- Name: idx_folders_parent_id; Type: INDEX; Schema: public; Owner: kan_user
--

CREATE INDEX idx_folders_parent_id ON public.folders USING btree (parent_id);


--
-- Name: idx_uploads_created_at; Type: INDEX; Schema: public; Owner: kan_user
--

CREATE INDEX idx_uploads_created_at ON public.uploads USING btree (created_at DESC);


--
-- Name: idx_uploads_folder_id; Type: INDEX; Schema: public; Owner: kan_user
--

CREATE INDEX idx_uploads_folder_id ON public.uploads USING btree (folder_id);


--
-- Name: folders folders_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.folders
    ADD CONSTRAINT folders_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.folders(id) ON DELETE CASCADE;


--
-- Name: uploads uploads_folder_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.uploads
    ADD CONSTRAINT uploads_folder_id_fkey FOREIGN KEY (folder_id) REFERENCES public.folders(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict JYy8ZNRx95ZFSLHbM4tjyvc8mF657jwmCtmVJRXOU7a4TOaLG5uoNXLA2wKM3S7

