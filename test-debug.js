const { initDatabase } = require('./src/server/db.ts');
const {
  QuestionEntity,
  UserEntity,
  TagEntity,
} = require('./src/server/models/entities.ts');

async function test() {
  try {
    await initDatabase();
    console.log('Database initialized...');

    const question = await QuestionEntity.findOne({
      where: { id: '1' },
      include: [
        {
          model: UserEntity,
          as: 'author',
          attributes: ['name', 'role', 'reputation'],
        },
        { model: TagEntity, as: 'questionTags', through: { attributes: [] } },
      ],
    });

    console.log('Question found:', question);
  } catch (error) {
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
  }
}

test()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
