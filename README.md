# alx-files_manager

This project is a compilation of back-end concepts: authentication, NodeJS, MongoDB, Redis, pagination and background processing.

The objective is to build a simple platform to upload and view files with:

User authentication via a token
Listing of all files
Uploading a new file
Changing permissions of a file
Viewing a file
Generating thumbnails for images
Core technologies
Redis	MongoDB	NodeJS
Testing and Jobs
A queueing job mechanism for creating thumbnails of photos uploaded to the application is included in the project. When a new user is created, it also leverages this feature to generate a welcome message. Bull is used in all of this.  Bull & NodeJS

Mocha is used in combination with Chai for testing the app.

Mocha & Chai

Authors
