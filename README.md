# Todo Manager

This is a simple todo SPA meant to demonstrate my understanding of full-stack fundamentals.

Features:
- Private lists via user accounts.
- Create, edit, and delete todo items.
- Todos are categorized by *completed status* and *due month* in navigation menu.
- Clicking on a category displays appropriate todos in main display.

Frontend:
- No frameworks, mostly vanilla JavaScript and browser APIs.
- jQuery for simplified DOM manipulation.
- [Handlebars](https://handlebarsjs.com/) template engine for building forms.
- Custom form validation with descriptive flash messages.

Backend:
- Node, using Express.
- Custom authorization service, implemented as a middleware with Express.
- Sessions managed via [express-session](https://www.npmjs.com/package/express-session).
- PosgreSQL storage via [pg-promise](https://www.npmjs.com/package/pg-promise).
- Passwords hashed via [bcrypt](https://www.npmjs.com/package/bcrypt).

~ Hosted on Heroku, deployed through GitHub.
Checkout the [live app](http://mclark-todo-app.herokuapp.com).