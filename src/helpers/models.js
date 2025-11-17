import { Model, DataTypes } from 'sequelize';
import bcrypt from 'bcrypt'

class User extends Model {
  static initModel(sequelize) {
    User.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        username: { type: DataTypes.STRING, unique: true, allowNull: false },
        email: { type: DataTypes.STRING, unique: true, allowNull: false },
        passwordHash: {
          type: DataTypes.STRING, allowNull: false,
          set(value) {
            this.setDataValue('passwordHash', bcrypt.hashSync(value, 10));
          },
        }
      },
      {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: false,
      }
    );
  }
}

class Blog extends Model {
  static initModel(sequelize) {
    Blog.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        title: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: true },
        authorId: { type: DataTypes.INTEGER, allowNull: false },
        avatarUrl: { type: DataTypes.STRING, allowNull: true },
        subDomain: { type: DataTypes.STRING, unique: true, allowNull: false },
        timeZone: { type: DataTypes.STRING, allowNull: true },
        dateFormat: { type: DataTypes.STRING, allowNull: true },
        siteFooter: { type: DataTypes.TEXT, allowNull: true },
        fontFamily: { type: DataTypes.STRING, allowNull: true },
        theme: { type: DataTypes.STRING, allowNull: true },
        useCustomCSS: { type: DataTypes.BOOLEAN, defaultValue: false },
        customCSS: { type: DataTypes.TEXT, allowNull: true },
        replyToEmail: { type: DataTypes.STRING, allowNull: true },
      },
      {
        sequelize,
        modelName: 'Blog',
        tableName: 'blogs',
        timestamps: false,
      }
    );
  }
}

class Post extends Model {
  static initModel(sequelize) {
    Post.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        blogId: { type: DataTypes.INTEGER, allowNull: false },
        slug: { type: DataTypes.STRING, unique: true, allowNull: false },
        title: { type: DataTypes.STRING, allowNull: false },
        content: { type: DataTypes.TEXT('long'), allowNull: false },
        tags: { type: DataTypes.STRING, allowNull: true },
        status: { type: DataTypes.ENUM('draft', 'published', 'archived'), defaultValue: 'draft' },
      },
      {
        sequelize,
        modelName: 'Post',
        tableName: 'posts',
        timestamps: true,
      }
    );
  }
}

class Page extends Model {
  static initModel(sequelize) {
    Page.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        blogId: { type: DataTypes.INTEGER, allowNull: false },
        slug: { type: DataTypes.STRING, unique: true, allowNull: false },
        title: { type: DataTypes.STRING, allowNull: false },
        body: { type: DataTypes.TEXT('long'), allowNull: false },
      },
      {
        sequelize,
        modelName: 'Page',
        tableName: 'pages',
        timestamps: true,
      }
    );
  }
}

class Navigation extends Model {
  static initModel(sequelize) {
    Navigation.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        blogId: { type: DataTypes.INTEGER, allowNull: false },
        name: { type: DataTypes.STRING, unique: true, allowNull: false },
        items: { type: DataTypes.TEXT, allowNull: false },
      },
      {
        sequelize,
        modelName: 'Navigation',
        tableName: 'navigations',
        timestamps: false,
      }
    );
  }
}

const initModels = (sequelize) => {
  User.initModel(sequelize);
  Post.initModel(sequelize);
  Page.initModel(sequelize);
  Navigation.initModel(sequelize);
  Blog.initModel(sequelize);

  Blog.belongsTo(User, { foreignKey: 'authorId', as: 'author' });
  User.hasMany(Blog, { foreignKey: 'authorId', as: 'blogs' });
  Post.belongsTo(Blog, { foreignKey: 'blogId', as: 'blog' });
  Blog.hasMany(Post, { foreignKey: 'blogId', as: 'posts' });
  Page.belongsTo(Blog, { foreignKey: 'blogId', as: 'blog' });
  Blog.hasMany(Page, { foreignKey: 'blogId', as: 'pages' });
  Navigation.belongsTo(Blog, { foreignKey: 'blogId', as: 'blog' });
  Blog.hasMany(Navigation, { foreignKey: 'blogId', as: 'navigations' });
}

export { initModels, User, Blog, Post, Page, Navigation };
