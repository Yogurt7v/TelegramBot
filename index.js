require('dotenv').config();
const { Bot, GrammyError, HttpError, Keyboard, InlineKeyboard } = require('grammy');

const bot = new Bot(process.env.BOT_API_KEY);

// меню команд и их описание
bot.api.setMyCommands([
  {
    command: 'start',
    description: 'Начало работы',
  },
  {
    command: 'say_somthing',
    description: 'Сообщение',
  },
  {
    command: 'sing',
    description: 'Споёт песенку',
  },
  {
    command: 'your_id',
    description: 'Ваш ID в телеграмм',
  },
  {
    command: 'date',
    description: 'Текущая дата',
  },
  {
    command: 'mood',
    description: 'Оценка настроения',
  },
  {
    command: 'eat',
    description: 'Как насчёт перекусить)?',
  },
  //   {
  //     command: "share",
  //     description: "Поделиться",
  //   },
]);

//последовательность очень важна. при первом совпадении вызывается только первый колбэк
//ctx - context
bot.command('start', async (ctx) => {
  await ctx.react('🍾');
  await ctx.reply("Привет! Тестовый на связи <a href='https://google.com'>Google</a>", {
    parse_mode: 'HTML',
  });
});

//клавиатуры
bot.command('mood', async (ctx) => {
  //   const keyboard = new Keyboard()
  //     .text("OK")
  //     .row()
  //     .text("NORM")
  //     .text("BAD")
  //     .resized()
  //     .oneTime();
  const moodLabels = ['OK', 'NORM', 'BAD'];
  const rows = moodLabels.map((label) => {
    return [Keyboard.text(label)];
  });
  const keyboard2 = Keyboard.from(rows).resized();

  await ctx.reply('Оценка настроения', {
    reply_markup: keyboard2,
  });
});

// bot.command('share', async (ctx) => {
//     const shareKeyboard = new Keyboard().requestLocation('Поделиться местоположением').requestContact('Поделиться контактами').requestPoll('Поделиться опросом').resized().oneTime();
//     await ctx.reply('Кнопки поделиться', { reply_markup: shareKeyboard });
// })

bot.command('eat', async (ctx) => {
  const keyboard = new InlineKeyboard()
    .text('суши', 'sushi')
    .text('пицца', 'pizza')
    .text('бургер', 'burger')
    .row()
    .text('Худеем!', 'exit');
  await ctx.reply('Чё похаваем?', { reply_markup: keyboard });
});

bot.callbackQuery(['sushi', 'pizza', 'burger', 'exit'], async (ctx) => {
  await ctx.answerCallbackQuery('Выбор сделан');
  if (ctx.match === 'sushi') {
    await ctx.reply('Опять суши?(');
  }
  if (ctx.match === 'pizza') {
    await ctx.reply('Люблю пиццу');
  }
  if (ctx.match === 'burger') {
    await ctx.reply('Жиреть так жиреть');
  }
  if (ctx.match === 'exit') {
    await ctx.reply('Хорошо. Будем питаться солнцем.');
  }
});

bot.command('your_id', async (ctx) => {
  await ctx.reply(`Ваш ID: ${ctx.from.id}. Ваш юзернейм: ${ctx.from.username}`);
});

// ответы на клавиатуру
bot.hears('OK', async (ctx) => {
  await ctx.reply('Очень хорошо');
});
bot.hears('NORM', async (ctx) => {
  await ctx.reply('Ну и славно', {
    reply_markup: {
      remove_keyboard: true,
    },
  });
});
bot.hears('BAD', async (ctx) => {
  await ctx.reply('Что случилось?');
});

// получения :text/photo/video/audio/voice/file... //::url = message:entires:url
bot.on([':media', '::url'], async (ctx) => {
  await ctx.reply('Ссылка получена');
});

bot.on(':photo').on('::hashtag', async (ctx) => {
  await ctx.reply('Фото c тегом получено');
});

// сообщения тримируются//
bot.hears(['Здорово', 'привет'], async (ctx) => {
  await ctx.reply('Ну привет');
});

// регулярные выражения
bot.hears(/мат/, async (ctx) => {
  await ctx.reply('Не ругайся!');
});

bot.command(['say_somthing', 'sing'], async (ctx) => {
  await ctx.reply('А сказать то и нечего)');
});

bot.command('date', async (ctx) => {
  const date = new Date().toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  });
  await ctx.reply(`Текущая дата: ${date}`);
});

//стандартный набот разбор ошибок
bot.catch((err) => {
  const ctx = err.ctx;
  console.log(`В данном обновлении произошла ошибка ${ctx.update.update_id}`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.log('Ошибка запроса', e.description);
  } else if (e instanceof HttpError) {
    console.log('Нет связи с Телеграм', e.description);
  } else {
    console.log('Неизвестная ошибка', e.description);
  }
});

bot
  .start()
  .then(() => {
    console.log('Бот запущен');
  })
  .catch((error) => {
    console.error('Ошибка запуска бота:', error.message);
  });
