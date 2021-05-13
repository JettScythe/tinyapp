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
    password: bcrypt.hashSync(password, 10)
  };
  // Add the user Object into the usersDb
  userDB[userId] = newUserObj;

  // return the id of the user
  return userId;
};

const fetchUserByEmail = (email, userDB) => {
  for (const user_id in userDB) {
    if (email === userDB[user_id].email) {
      const user = userDB[user_id];
      return user;
    }
  }
}

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
  for (const user_id in urlDB) {
    if (urlDB[user_id].userID === id) {
      userURLS[user_id] = urlDB[user_id];
    }
  }
  return userURLS;
};


module.exports = { genRandomString, addNewUser, authenticateUser, urlsForUsers, fetchUserByEmail }