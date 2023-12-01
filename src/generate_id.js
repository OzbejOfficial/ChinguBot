const { createCanvas, loadImage, registerFont } = require('canvas');

// Load a font (you may need to provide the path to a font file)
registerFont('../assets/Hezaedrus-Medium.ttf', { family: 'Hezaedrus' });

async function generateIDCard(user) {
  const canvas = createCanvas(400, 250);
  const ctx = canvas.getContext('2d');

  // Load background image
  const background = await loadImage('../assets/idcardtemplate.png');
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  // User information
  ctx.fillStyle = '#000000';
  ctx.font = '20px Hezaedrus';
  ctx.fillText(`Name: ${user.username}`, 20, 40);
  ctx.fillText(`ID: ${user.id}`, 20, 80);

  // Load and draw user's avatar
  const avatar = await loadImage(user.avatarURL);
  ctx.drawImage(avatar, 250, 20, 120, 120);

  // Save the image
  const buffer = canvas.toBuffer('image/png');
  return buffer;
}

// Example usage
const user = {
  username: 'John Doe',
  id: '123456789012345678',
  avatarURL: 'path/to/user/avatar.png',
};

generateIDCard(user).then((buffer) => {
  require('fs').writeFileSync('../public/id_cards/id_card.png', buffer);
});
