const { ModalBuilder, TextInputBuilder, TextInputStyle, Client, GatewayIntentBits , PermissionsBitField , ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder  } = require('discord.js');
const { Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const data = require("./config.json");
const client = new Client({
  checkUpdate: false,
  intents: [GatewayIntentBits.Guilds]
}); 

function run(){
  const clientid = data.clientid;
  const commands = [
    new SlashCommandBuilder().setName('setup').setDescription('Adds The Ticket Bot').addStringOption(option =>
      option.setName('roleid')
        .setDescription('ID Of The Support Team Role')
        .setRequired(true)).addStringOption(option =>
          option.setName('opencat')
            .setDescription('ID Of The Opened tickets Category')
            .setRequired(true)).addStringOption(option =>
              option.setName('closedcat')
                .setDescription('ID Of The Closed tickets Category')
                .setRequired(true)).addStringOption(option =>
                  option.setName('submission')
                    .setDescription('ID Of The Submission Requsts Category')
                    .setRequired(true)),
  ].map(command => command.toJSON());
  
  const builder = Routes.applicationCommands(clientid);
  
  const rest = new REST({ version: '10' }).setToken(data.token);
  
  rest.put(builder, { body: commands },)
    .then(() => null)
    .catch(console.error);
  
  client.on('ready', async () => {
    console.log(`${client.user.username} is ready!`);
  })
  let green = ["#57F287"];
  var roleid = null;
  var opencat = null;
  var closecat = null;
  var submission = null;
  var userwho = null;
  client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
      if (interaction.commandName === 'setup') {
        const user_object = interaction.user;
        const USID = user_object.id
        if (USID !== "990814965990580274"){
          await interaction.reply({content: "You Are Not the Bot Owner", ephemeral: true})
        }
        roleid = interaction.options.getString("roleid");
        opencat = interaction.options.getString("opencat");
        closecat = interaction.options.getString("closedcat");
        submission = interaction.options.getString("submission");
        const channel = interaction.channel;
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('order').setLabel('🛒 Order').setStyle(ButtonStyle.Success),
			new ButtonBuilder().setCustomId('support').setLabel('✉️ Support').setStyle(ButtonStyle.Danger),
			new ButtonBuilder().setCustomId('apps').setLabel('🛠️ Applications').setStyle(ButtonStyle.Secondary),
          );
          await interaction.reply({ embeds: [{
            title: '[✅] Event',
            description: 'Message Has Been Created',
            color: 58376
          }], ephemeral: true });
        await channel.send({ embeds: [{
          title: 'CookieDevelopment Tickets',
          description: data.TicketMessage,
          color: 15105570
        }], components: [row] });
      }
	}
    if (interaction.isButton()) {
          const customid = interaction.customId;
          if (customid == "support"){
            const user_object = interaction.user;
            const username = user_object.username;
            const guild = interaction.guild;
            const name = "TICKET-" + username + "-" + Date.now();
            userwho = username;
            const everyone = guild.roles.cache.find((role) => role.name === "@everyone");
            const msgchannel = await interaction.guild.channels.create({
              name: name,
              type: 0,
              description: 'Ticket Created By ' + username + '.',
              position: 1,
              permissionOverwrites: [{
                  id: user_object.id,
                  allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
              },{
                id: roleid,
                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
            }, {
              id: everyone,
              deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory]
            }]
          }); 
          msgchannel.permissionOverwrites.edit(everyone, {
            SendMessages: false, ViewChannel: false, ReadMessageHistory: false
          })
          await msgchannel.setParent(opencat);
          msgchannel.lockPermissions();
          const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('close')
              .setLabel('📪 Close The Ticket')
              .setStyle(ButtonStyle.Primary),
          );
          const id = msgchannel.id;
          const ready_object = await client.channels.fetch(id);
            await ready_object.send({embeds: [{
              title: 'Changed Your Mind?',
              description: 'Close This Ticket By Clicking The Button.',
              color: 58376
            }], components: [row] });
            await interaction.reply({embeds: [{
              title: '[✅] Opened!',
              description: 'A Ticket Has Been Opened',
              color: 58376
            }], ephemeral: true});
          }else if (customid === 'close'){
            const guild = interaction.guild;
            const channelID = interaction.channelId;
            const user_object = interaction.user;
            const channel = await guild.channels.fetch(channelID).then((channel) => {return channel})
            const everyone = guild.roles.cache.find((role) => role.name === "@everyone");
            await channel.setParent(closecat);
            channel.permissionOverwrites.edit(user_object.id, {
              SendMessages: false, ViewChannel: false, ReadMessageHistory: false
            })
            channel.permissionOverwrites.edit(everyone, {
              SendMessages: false, ViewChannel: false, ReadMessageHistory: false
            })
            channel.lockPermissions();
            await interaction.reply({content: "done", ephemeral: true})
            
      }else  if (customid === 'order'){
			const modal = new ModalBuilder()
			.setCustomId('orderform')
			.setTitle('Order Form');

		// Add components to modal

		// Create the text input components
		const budget = new TextInputBuilder()
			.setCustomId('budget')
			.setLabel("What's your budget?")
			.setStyle(TextInputStyle.Short);

		const details = new TextInputBuilder()
			.setCustomId('deadline')
			.setLabel("What's the deadline?")
			.setStyle(TextInputStyle.Short);
		const deadline = new TextInputBuilder()
			.setCustomId('details')
			.setLabel("What are the details for your request?")
			.setStyle(TextInputStyle.Paragraph);
		const refrence = new TextInputBuilder()
			.setCustomId('refrence')
			.setLabel("Can You Provide Some references?")
			.setStyle(TextInputStyle.Paragraph);
      
		const budgetform = new ActionRowBuilder().addComponents(budget);
		const detailsform = new ActionRowBuilder().addComponents(details);
		const deadlineform = new ActionRowBuilder().addComponents(deadline);
		const refrenceform = new ActionRowBuilder().addComponents(refrence);
		// Add inputs to the modal
		modal.addComponents(budgetform, detailsform, deadlineform, refrenceform);

		await interaction.showModal(modal);
        }else if (customid === 'apps'){
          const modal = new ModalBuilder()
          .setCustomId('appsform')
          .setTitle('Application Form');
    
        // Add components to modal
    
        // Create the text input components
        const role = new TextInputBuilder()
          .setCustomId('role')
          .setLabel("What role will you be applying for?")
          .setStyle(TextInputStyle.Short);
    
        const portfolio = new TextInputBuilder()
          .setCustomId('portfolio')
          .setLabel("What's your portfolio? (FREELANERS ONLY)")
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(false)
          .setValue("None");
        const vouches = new TextInputBuilder()
          .setCustomId('vouches')
          .setLabel("Do you have any past reviews/vouches?")
          .setStyle(TextInputStyle.Short);
        const timeri = new TextInputBuilder()
          .setCustomId('timeri')
          .setLabel("How long have you been a freelancer/seller?")
          .setStyle(TextInputStyle.Short);
          
        const roleform = new ActionRowBuilder().addComponents(role);
        const portfolioform = new ActionRowBuilder().addComponents(portfolio);
        const vouchesform = new ActionRowBuilder().addComponents(vouches);
        const timeform = new ActionRowBuilder().addComponents(timeri);
        // Add inputs to the modal
        modal.addComponents(roleform,portfolioform,vouchesform,timeform);
    
        await interaction.showModal(modal);
            }
    }
	if (interaction.isModalSubmit()){
		if (interaction.customId === 'orderform') {
      
      const user_object = interaction.user;
      const username = user_object.username;
      const guild = interaction.guild;
      const name = "ORDERSUBMISSION-" + username + "-" + Date.now();
      const msgchannel = await interaction.guild.channels.create({
        name: name,
        type: 0,
        description: 'Order Submission Created By ' + username + '.',
        position: 1,
        permissionOverwrites: [{
        id: everyone,
        deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory]
      }]
    });
    msgchannel.permissionOverwrites.edit(everyone, {
      SendMessages: false, ViewChannel: false, ReadMessageHistory: false
    })
    const details = interaction.fields.getTextInputValue('details');
    const deadline = interaction.fields.getTextInputValue('deadline');
    const budget = interaction.fields.getTextInputValue('budget');
    const refrence = interaction.fields.getTextInputValue('refrence');
    await msgchannel.setParent(submission)
    msgchannel.lockPermissions();
    const vre = `User: ${username}
    Budget: ${budget}
    Deadline: ${deadline}
    Details: ${details}
    References: ${refrence}`
    msgchannel.send({embeds: [{
      title: '[🛂] Order Submission',
      description: vre,
      color: 58376
    }]})
    await interaction.reply({ content: 'Your Order request was received successfully!', ephemeral: true });
		}else if (interaction.customId === 'appsform') {
      
      const user_object = interaction.user;
      const username = user_object.username;
      const guild = interaction.guild;
      const everyone = guild.roles.cache.find((role) => role.name === "@everyone");
      const name = "APPSUBMISSION-" + username + "-" + Date.now();
      const msgchannel = await interaction.guild.channels.create({
        name: name,
        type: 0,
        description: 'Application Submission Created By ' + username + '.',
        position: 1,
        permissionOverwrites: [{
        id: everyone,
        deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory]
      }]
    });
    msgchannel.permissionOverwrites.edit(everyone, {
      SendMessages: false, ViewChannel: false, ReadMessageHistory: false
    })
    const role = interaction.fields.getTextInputValue('role');
    const portfolio = interaction.fields.getTextInputValue('portfolio');
    const vouches = interaction.fields.getTextInputValue('vouches');
    const timeri = interaction.fields.getTextInputValue('timeri');
    await msgchannel.setParent(submission)
    msgchannel.lockPermissions();
    const vre = `User: ${username}
    Role: ${role}
    Portfolio: ${portfolio}
    Vouches: ${vouches}
    Experience: ${timeri}`
    msgchannel.send({embeds: [{
      title: '[🛂] Application Submission',
      description: vre,
      color: 58376
    }]})
			await interaction.reply({ content: 'Your Application request was received successfully!', ephemeral: true });
		}
	}
	
      });
      
  
  client.login(data.token);
  }
run()