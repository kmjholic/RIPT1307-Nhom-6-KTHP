import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db';

export class UserEntity extends Model {
  declare id: string;
  declare name: string;
  declare email: string;
  declare password?: string;
  declare role: 'sinhvien' | 'giangvien' | 'admin';
  declare department?: string;
  declare major?: string;
  declare studentId?: string;
  declare avatar?: string;
  declare bio?: string;
  declare reputation: number;
  declare posts: number;
  declare answers: number;
  declare votes: number;
  declare followers: number;
  declare following: number;
  declare joinDate: string;
  declare badges: string[];
  declare status: 'active' | 'banned';

  // Associations
  declare questions?: QuestionEntity[];
  declare comments?: CommentEntity[];
}

UserEntity.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING(255), allowNull: true },
    role: {
      type: DataTypes.ENUM('sinhvien', 'giangvien', 'admin'),
      defaultValue: 'sinhvien',
    },
    department: { type: DataTypes.STRING, allowNull: true },
    major: { type: DataTypes.STRING, allowNull: true },
    studentId: { type: DataTypes.STRING, allowNull: true },
    avatar: { type: DataTypes.STRING, allowNull: true },
    bio: { type: DataTypes.TEXT, allowNull: true },
    reputation: { type: DataTypes.INTEGER, defaultValue: 10 },
    posts: { type: DataTypes.INTEGER, defaultValue: 0 },
    answers: { type: DataTypes.INTEGER, defaultValue: 0 },
    votes: { type: DataTypes.INTEGER, defaultValue: 0 },
    followers: { type: DataTypes.INTEGER, defaultValue: 0 },
    following: { type: DataTypes.INTEGER, defaultValue: 0 },
    joinDate: { type: DataTypes.STRING, allowNull: false },
    badges: {
      type: DataTypes.TEXT,
      defaultValue: '[]',
      get() {
        const rawValue = this.getDataValue('badges') as any;
        try {
          return rawValue ? JSON.parse(rawValue) : [];
        } catch {
          return [];
        }
      },
      set(val: string[]) {
        this.setDataValue('badges', JSON.stringify(val) as any);
      },
    },
    status: {
      type: DataTypes.ENUM('active', 'banned'),
      defaultValue: 'active',
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    timestamps: false,
  },
);

export class TagEntity extends Model {
  declare name: string;
  declare count: number;
  declare color: string;
  declare category: string;
  declare desc: string;

  // Associations
  declare taggedQuestions?: QuestionEntity[];
}

TagEntity.init(
  {
    name: { type: DataTypes.STRING, primaryKey: true },
    count: { type: DataTypes.INTEGER, defaultValue: 0 },
    color: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '#3b82f6',
    },
    category: { type: DataTypes.STRING, allowNull: false },
    desc: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    modelName: 'Tag',
    tableName: 'Tags',
    timestamps: false,
  },
);

export class QuestionEntity extends Model {
  declare id: string;
  declare title: string;
  declare excerpt: string;
  declare content: string;
  declare authorId: string;
  declare votes: number;
  declare commentsCount: number;
  declare views: number;
  declare subject?: string;
  declare isSolved: boolean;
  declare status: 'active' | 'reported' | 'hidden';
  declare createdAt: Date;

  // Associations
  declare author?: UserEntity;
  declare questionTags?: TagEntity[];
  declare questionComments?: CommentEntity[];
}

QuestionEntity.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    excerpt: { type: DataTypes.TEXT, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    authorId: { type: DataTypes.STRING, allowNull: false },
    votes: { type: DataTypes.INTEGER, defaultValue: 0 },
    commentsCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    views: { type: DataTypes.INTEGER, defaultValue: 0 },
    subject: { type: DataTypes.STRING, allowNull: true },
    isSolved: { type: DataTypes.BOOLEAN, defaultValue: false },
    status: {
      type: DataTypes.ENUM('active', 'reported', 'hidden'),
      defaultValue: 'active',
    },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: 'Question',
    tableName: 'Questions',
    timestamps: true,
    updatedAt: false,
  },
);

export class CommentEntity extends Model {
  declare id: string;
  declare questionId: string;
  declare parentId?: string | null;
  declare authorId: string;
  declare votes: number;
  declare isBest: boolean;
  declare content: string;
  declare createdAt: Date;

  // Associations
  declare author?: UserEntity;
  declare replies?: CommentEntity[];
  declare parent?: CommentEntity;
}

CommentEntity.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    questionId: { type: DataTypes.STRING, allowNull: false },
    parentId: { type: DataTypes.STRING, allowNull: true },
    authorId: { type: DataTypes.STRING, allowNull: false },
    votes: { type: DataTypes.INTEGER, defaultValue: 0 },
    isBest: { type: DataTypes.BOOLEAN, defaultValue: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: 'Comment',
    tableName: 'Comments',
    timestamps: true,
    updatedAt: false,
  },
);

export class VoteEntity extends Model {
  declare id: string;
  declare userId: string;
  declare targetId: string;
  declare targetType: 'question' | 'comment';
  declare value: number;
}

VoteEntity.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    userId: { type: DataTypes.STRING, allowNull: false },
    targetId: { type: DataTypes.STRING, allowNull: false },
    targetType: {
      type: DataTypes.ENUM('question', 'comment'),
      allowNull: false,
    },
    value: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    modelName: 'Vote',
    tableName: 'Votes',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'targetId', 'targetType'],
      },
    ],
  },
);

// Associations
UserEntity.hasMany(QuestionEntity, { foreignKey: 'authorId', as: 'questions' });
QuestionEntity.belongsTo(UserEntity, { foreignKey: 'authorId', as: 'author' });

UserEntity.hasMany(CommentEntity, { foreignKey: 'authorId', as: 'comments' });
CommentEntity.belongsTo(UserEntity, { foreignKey: 'authorId', as: 'author' });

QuestionEntity.hasMany(CommentEntity, {
  foreignKey: 'questionId',
  as: 'questionComments',
});
CommentEntity.belongsTo(QuestionEntity, { foreignKey: 'questionId' });

CommentEntity.hasMany(CommentEntity, { foreignKey: 'parentId', as: 'replies' });
CommentEntity.belongsTo(CommentEntity, {
  foreignKey: 'parentId',
  as: 'parent',
});

QuestionEntity.belongsToMany(TagEntity, {
  through: 'QuestionTags',
  foreignKey: 'questionId',
  as: 'questionTags',
});
TagEntity.belongsToMany(QuestionEntity, {
  through: 'QuestionTags',
  foreignKey: 'tagName',
  as: 'taggedQuestions',
});
