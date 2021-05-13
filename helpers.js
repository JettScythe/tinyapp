const bcrypt = require('bcrypt');
const crypto = require('crypto');

const genRandomString = () => {
  const randomString = crypto.randomBytes(3).toString('hex');
  return randomString;
};

const addNewUser = (name, email, password, userDB) => {
  // Generate a random id
  const userId = genRandomString();

  const newUserObj = {
    id: userId,
    name,
    email,
    //encrypts the new user's password with bcrypt
    password: bcrypt.hashSync(password, 10)
  };
  // Add the user Object into the usersDb
  userDB[userId] = newUserObj;

  // return the id of the user
  return userId;
};

const fetchUserByEmail = (email, userDB) => {
  for (const userId in userDB) {
    if (email === userDB[userId].email) {
      const user = userDB[userId];
      return user;
    }
  }
};

const authenticateUser = (email, password, userDB) => {
  // retrieve the user with that email
  const user = fetchUserByEmail(email, userDB);

  // if we got a user back and the passwords match then return the userObj
  if (user && bcrypt.compareSync(password, user.password)) {
    // user is authenticated
    return user;
  } else {
    // Otherwise return false
    return false;
  }
};

const urlsForUsers = (id, urlDB) => {
  const userURLS = {};
  for (const url in urlDB) {
    if (urlDB[url].userID === id) {
      userURLS[url] = urlDB[url];
    }
  }
  return userURLS;
};


module.exports = { genRandomString, addNewUser, authenticateUser, urlsForUsers, fetchUserByEmail };