import bcrypt from 'bcrypt';

const password = 'admin123';
console.log('Generating hash for password:', password);

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Generated hash:', hash);
    console.log('\nSQL to update superadmin password:');
    console.log(`UPDATE users SET password_hash = '${hash}' WHERE email = 'superadmin@waitumusic.com';`);
  }
});
