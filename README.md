# hapiapp
> User Authentication using JWT JSON WebToken in Node.js using Hapijs, Used Joi for user input validation, mongoose for ORM, Winston for error logging, Boom for returning error response object

## Installation

```sh
npm install
```

## Setup
Create .env file on root directory and add the below code
```sh
SECRET = AIzaSyAQfxPJiounkhOjODEO5ZieffeBv6yft2Q
PORT = 8000
MONGO_URI = mongodb://localhost:27017/hapiapp
NODE_ENV = development
EMAIL_ID = example@example.com
EMAIL_PWD = example
```

## Start an app

```sh
npm start
```

### *API Available*

###### *Signup User*

	POST: http://localhost:8000/auth/signup

	{
		"firstname": "Jitendra",
		"lastname": "Kumar",
		"email": "contactjittu@gmail.com"
	}
  
###### *Login User*

	POST: http://localhost:8000/auth/login

	{
		"email": "contactjittu@gmail.com",
		"password": "123"
	}
	
###### *Forgot password*

	POST: http://localhost:8000/auth/forgot
	
	{
		"email":"contactjittu@gmail.com"
	}
	
###### *Reset password* - You will get token on email address
	
	POST: http://localhost:8000/auth/resetpassword/:token
	
	{
	 	"password": 123
	}
