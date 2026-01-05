const { Client, GatewayIntentBits, ChannelType } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const TOKEN = 'const TOKEN = const TOKEN = process.env.TOKEN;

const TRIGGER_CALL_ID = '1457747684780937381';

// ⏱️ cooldown para evitar múltiplos triggers
const cooldown = new Set();

client.once('ready', () => {
  console.log('🤖 Bot online!');
});

// =======================
// FUNÇÃO RANDOM CALL
// =======================
async function moveToRandomCall(member) {
  if (!member.voice.channel) return;

  const guild = member.guild;

  const voiceChannels = guild.channels.cache.filter(
    ch =>
      ch.type === ChannelType.GuildVoice &&
      ch.id !== member.voice.channel.id &&
      ch.id !== TRIGGER_CALL_ID
  );

  if (voiceChannels.size === 0) return;

  const randomChannel = voiceChannels.random();

  try {
    await member.voice.setChannel(randomChannel);
    console.log(`🎲 ${member.user.username} → ${randomChannel.name}`);
  } catch (err) {
    console.error('Erro ao mover:', err);
  }
}

// =======================
// COMANDO PELO CHAT
// =======================
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content === '!randomcall') {
    if (!message.member.voice.channel) {
      return message.reply('❌ Você não está em uma call.');
    }

    await moveToRandomCall(message.member);
    message.reply('🎲 Você foi movido!');
  }
});

// =======================
// AO ENTRAR NA CALL TRIGGER (CORRIGIDO)
// =======================
client.on('voiceStateUpdate', async (oldState, newState) => {
  // entrou em uma call
  if (!oldState.channel && newState.channel) {

    if (newState.channel.id !== TRIGGER_CALL_ID) return;
    if (newState.member.user.bot) return;

    const memberId = newState.member.id;

    // evita múltiplos disparos
    if (cooldown.has(memberId)) return;

    cooldown.add(memberId);

    // pequeno delay para o Discord estabilizar
    setTimeout(async () => {
      await moveToRandomCall(newState.member);

      // remove do cooldown depois
      setTimeout(() => cooldown.delete(memberId), 2000);
    }, 500);
  }
});

client.login(TOKEN);

