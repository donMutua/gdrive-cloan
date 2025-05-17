# Cloud Storage Platform (gdrive-clone)

## Overview

This project is a full-stack web application designed to emulate core functionalities of a cloud storage service like Google Drive. It allows users to upload, download, manage, and organize files and folders in a secure, personal cloud environment. The application features user authentication, file and folder operations (CRUD, move, copy, rename), and search capabilities.

## Features

- **User Authentication:** Secure user sign-up, sign-in, and session management powered by [Clerk](https://clerk.com/).
- **File Management:**
  - Upload various file types with validation for name and size (max 10MB per file).
  - Download files securely (uses signed URLs for Cloudinary assets).
  - Rename files.
  - Copy files to different locations, with automatic naming for duplicates (e.g., "filename (copy)", "filename (copy 2)").
  - Move files between folders or to the root directory.
  - Delete files (also removes them from Cloudinary).
- **Folder Management:**
  - Create new folders within existing folders or at the root level.
  - Rename folders.
  - Move folders, preventing circular dependencies (e.g., moving a parent folder into its own child).
  - Delete folders (currently deletes files directly within the folder; recursive deletion of sub-folders is a future improvement).
- **Storage & Database:**
  - File metadata (name, type, size, path, timestamps, etc.) and folder structure are stored in a Supabase (PostgreSQL) database.
  - Actual file assets are uploaded to and served from [Cloudinary](https://cloudinary.com/).
- **Search Functionality:** Users can search for files and folders by name.
- **User Profile Management:**
  - View and update basic user profile information (first name, last name).
  - Avatar display with fallback to Clerk's user image or a default avatar.
- **Storage Statistics:**
  - Dashboard display of storage usage (used vs. limit), file count, folder count.
  - Breakdown of storage by file type.
- **Client-Side State Management:** Utilizes `@tanstack/react-query` (React Query) for efficient data fetching, caching, and optimistic updates for a smoother user experience.
- **API:** Robust backend API built with Next.js API Routes to handle all core operations.

## Tech Stack

- **Framework:** Next.js (App Router likely, given API route structure)
- **Authentication:** Clerk
- **Database:** Supabase (PostgreSQL)
- **File Storage:** Cloudinary
- **Frontend:**
  - React
  - TypeScript
  - Tailwind CSS (inferred from `cn` utility)
  - `@tanstack/react-query` for client-side data management
- **Backend:**
  - Next.js API Routes
  - TypeScript
- **Deployment:** (Not specified, but Next.js is Vercel-friendly)

## Project Structure Highlights

The project is organized with a clear separation of concerns:

- `src/app/api/`: Contains all backend API route handlers for different resources (files, folders, search, upload, user, storage).
  - Dynamic routes like `files/[id]/route.ts` and `folders/[id]/route.ts` handle operations on specific items.
  - Specialized routes like `files/[id]/move/route.ts` or `folders/[id]/copy/route.ts` handle specific actions.
- `src/hooks/`: Custom React hooks for managing client-side logic and data fetching (`useFiles`, `useFolders`, `useFileUpload`, `useSearch`, `useStorage`, `useUserProfile`, `useAuthGuard`, `useDebounce`).
- `src/lib/`: Contains core utilities, configurations, and helper functions.
  - `supabase.ts`: Supabase client initialization (for server and browser).
  - `cloudinary.ts`: Cloudinary SDK configuration and helper functions for upload, delete, and signed URLs.
  - `validations.ts`: Input validation functions (file name, size).
  - `error-logger.ts`: Standardized error logging.
  - `auth.ts`: Authentication utility functions.
- `src/types/`: TypeScript type definitions, including `supabase.ts` (auto-generated or custom Supabase types) and `file-system.ts` (custom types for files/folders).
- `src/middleware.ts`: Clerk middleware for protecting routes.

## API Endpoints (Summary)

- **Files:**
  - `GET /api/files`: List files (can be filtered by `parentId`).
  - `GET /api/files/[id]`: Get a specific file.
  - `PATCH /api/files/[id]`: Rename a file.
  - `DELETE /api/files/[id]`: Delete a file.
  - `POST /api/files/[id]/move`: Move a file.
  - `POST /api/files/[id]/copy`: Copy a file (Note: current path in code is `/api/files/copy`, should likely be `/[id]/copy`).
  - `GET /api/files/[id]/download`: Get a download URL for a file (Note: current path in code is `/api/files/download`, should likely be `/[id]/download`).
  - `POST /api/upload`: Upload a new file.
- **Folders:**
  - `GET /api/folders`: List folders (can be filtered by `parentId`).
  - `POST /api/folders`: Create a new folder.
  - `GET /api/folders/[id]`: Get a specific folder.
  - `PATCH /api/folders/[id]`: Rename a folder.
  - `DELETE /api/folders/[id]`: Delete a folder and its direct files.
  - `POST /api/folders/[id]/move`: Move a folder.
  - `POST /api/folders/[id]/copy`: (Currently problematic - see "Known Issues")
- **Search:**
  - `GET /api/search?query=...`: Search files and folders.
- **User:**
  - `GET /api/user/profile`: Get user profile.
  - `PATCH /api/user/profile`: Update user profile.
- **Storage:**
  - `GET /api/storage`: Get storage statistics.

## Setup and Installation

1.  **Prerequisites:** Node.js, npm/yarn/pnpm.
2.  **Clone the repository.**
3.  **Install dependencies:** `npm install` (or `yarn install`, `pnpm install`).
4.  **Environment Variables:**

    - Create a `.env.local` file in the root directory.
    - Add the necessary environment variables for:
      - Clerk (Publishable Key, Secret Key)
      - Supabase (URL, Anon Key, Service Role Key)
      - Cloudinary (Cloud Name, API Key, API Secret)

    ```env
    # Clerk
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
    CLERK_SECRET_KEY=your_clerk_secret_key
    NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in
    NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

    # Supabase
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

    # Cloudinary
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    ```

5.  **Run the development server:** `npm run dev` (or `yarn dev`, `pnpm dev`).
6.  Open http://localhost:3000 in your browser.

## Known Issues / Areas for Improvement

- **Folder Copy Functionality:** The API endpoint `/api/folders/[id]/copy/route.ts` currently contains logic for copying _files_, not folders. This needs to be refactored to implement recursive folder copying (including all its contents).
- **Recursive Operations:**
  - Folder deletion is not recursive. Deleting a folder only removes files directly within it, not subfolders or their contents.
  - As mentioned, folder copying would also require a recursive approach.
- **API Route Naming for File Operations:**
  - The file copy endpoint is currently at `/src/app/api/files/copy/route.ts` but its implementation uses `params.id`, suggesting it should be `/src/app/api/files/[id]/copy/route.ts`.
  - Similarly, the file download endpoint is at `/src/app/api/files/download/route.ts` but uses `params.id`, suggesting it should be `/src/app/api/files/[id]/download/route.ts`.
- **`Params` Interface in API Routes:** The `Params` interface in API routes (e.g., `interface Params { params: Promise<{ id: string; }>; }`) is non-standard. Next.js typically provides `params` directly. This could be simplified to `{ params: { id: string } }` to remove the need for `await params`.
- **Client-Side Data Mutations:** Some data mutations in React Query hooks (e.g., in `use-folders.ts` for create, rename, delete) interact directly with the Supabase client-side SDK. While functional, consistently using API endpoints for all mutations could offer better separation of concerns, centralized validation, and potentially enhanced security.
- **Error Handling in Hooks:** Frontend `fetch` calls in hooks could benefit from more robust error parsing from API responses rather than generic error messages.
- **`useFileUpload` Hook:** The `createFile` call within `useFileUpload` uses a placeholder `userId`. This should be refactored to use the actual `userId` more cleanly, perhaps by passing it to the hook or initializing `useFiles` within the upload function when `userId` is available. The Cloudinary upload is currently simulated and would need to be implemented.
