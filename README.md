# Aggregation Drive

> It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness, it was the spring of hope, it was the winter of despair, we had everything before us, we had nothing before... - Mark Twain (Tale of Two Cities, 1859)

Why are we so limited in a time of abundance?

If you're like me, you probably have 25GB of Box Storage, 5GB of Dropbox, 20GB of Google Drive, 30GB of OneDrive, 200GB of iCloud, Scalable S3 etc, with each of these drives holding a significant chunk of your personal files/folders.
With the storage spaces available, one would think you'd have enough space for all your files to be in the cloud, but apparently, that doesn't work, because each OS you use implicitly prefers a certain cloud storage option, even worse is that Cloud Storage Providers aren't IMAP/POP3 clients, so they don't work together to help aggregate your files, meaning it's one OR the other and without a unified view, you're left to choose and it only gets worse when you're trying to locate a particular file.
Again, if you're like me, you probably have significant chunk of your files on each of these, probably from a long time ago, when you had affinity for one.

## What's this project about?
Primarily, this project is to aggregate the files/folders on your Drive, but even more is to be able to act like a distributed FS.

## Get Started
Starting up should ideally require you to create a developer account for the services you intend to aggregate and place their appropriate variables in your environment(all environment variables should ideally be restricted to the config folder).

Run
```sh
npm install
npm start
```

A very minimal interface is provided for uploading files/folder:

```sh
open http://localhost:3000/upload
```

Upload the files or folders you wish to upload then depending on the usage quota of your drive, you should see the files populated in your drives.
PS; if you don't care about any load balancing, you may adjust the strategy in `services/*/client.js -> calculateQuotaUsage` to whatever percentage of the upload should go where. e.g. to equally distribute, return the same value for the storages.

## Features
Upload files/folders
Load balancing - distributes files on your Cloud Storage based on your usage quota
Flat folder - all uploaded files are stored in a single folder on each Cloud Storage Service, but they're logically grouped in the database, so the DB is ever the only source of truth

## TODO
- Prefer TypeScript for interface definitions
- Manifest should either be centralized or distributed on each storages for easier coordination
- FUSE
- Web FileManager
- [x] Construct File Tree for proper management of File/Folder operations
- [] Improve SQL query: use bulkUpdate and bulkFetch
- Implement Aggregated View for all files/folders on all Drives
- Plugin Architecture for additional storage engines
- Factor in file/folder sizes during uploads, without needing to make an external API call to get storage quota usage.
- Split huge files so they can be uploaded anywhere(e.g. Box has an upload limit of about ~2-3GB) and merge the splitted files.
- Find way of bypassing machine FS storage
- Customize user fs - Allow users to determine how their uploads are handled e.g. prefer certain drives(only try to upload to other drives when preferred drive isn't available) or allow certain drives to handle specific file extensions or disable virtual FS(e.g uploads should mirror the original upload path- to allow user management in cloud).


### Technologies
- Docker
- NodeJS
- ExpressJS
- Sqlite3
- LevelDB
- FUSE

PS: this project is not a Cloud Storage Provider, but it/ought to work with your existing storage providers and set them as a backend for your storage needs.

You know what's better than multiple Cloud Storage Systems?
