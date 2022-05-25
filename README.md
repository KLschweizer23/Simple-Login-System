# Simple-Login-System

Step-by-step to work with the system...

clone the repo first:
```git
$ git clone https://github.com/KLschweizer23/Simple-Login-System
```

Then change Directory to your cloned repo:
```git
$ cd Simple-Login-System
```

Install the Node:
```git
$ npm install
```

Then copy the .env.example to create your own .env
```git
$ cp .env.example .env
```

IMPORTANT THINGS TO CONFIGURE IN .env

1. Change your own session, the longer the better
```
SESSION_SECRET=secret
```

2. Adjust to your DATABASE_URL
```
DATABASE_URL="mysql://user:password@host:port/schema
```
Example:
```
DATABASE_URL="mysql://root:mypassword@localhost:3306/simple_schema
```

3. Make Sure to create the schema in your mysql workbench!


