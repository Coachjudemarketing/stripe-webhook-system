export async function createUserIfNotExists(email) {
  global.users = global.users || [];
  let user = global.users.find(u => u.email === email);
  if (!user) {
    user = { id: Date.now().toString(), email, access: [], createdAt: Date.now(), save: async function() {} };
    global.users.push(user);
  }
  return user;
}
