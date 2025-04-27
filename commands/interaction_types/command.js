const clanCommands = require("../clans");
const techCommands = require("../tech");
const genericCommands = require("../generic");
const itemsCommands = require("../items");
const tradesCommands = require("../trades");
const clanPermissions = require("../../helpers/permissions");
const configuration = require("../../helpers/config");
const logger = require("../../helpers/logger");

const controller = {};

controller.router = async (interaction, client) => {
  try {
    if (interaction.commandName === "vote") {
      await interaction.reply(
        `Help us grow by voting here: https://top.gg/bot/${process.env.DISCORD_CLIENT_ID}`
      );
    } else if (interaction.commandName === "loinfo") {
      await interaction.reply({ embeds: [genericCommands.getInfoContent()] });
    } else if (interaction.commandName === "craft") {
      itemsCommands.getNecessaryMaterials(
        interaction,
        interaction.options.getString("item").trim().toLowerCase(),
        interaction.options.getInteger("quantity")
          ? interaction.options.getInteger("quantity")
          : 1
      );
    } else if (interaction.commandName === "recipe") {
      itemsCommands.sendRecipe(
        interaction,
        interaction.options.getString("code").trim()
      );
    } else if (interaction.commandName === "tradesearch") {
      const params = {
        discordid: interaction.member.id,
      };
      params.page = interaction.options.getInteger("page")
        ? interaction.options.getInteger("page")
        : 1;
      params.resource = interaction.options.getString("resource")
        ? interaction.options.getString("resource").trim()
        : undefined;
      params.region = interaction.options.getString("region")
        ? interaction.options.getString("region").trim()
        : undefined;
      params.type = interaction.options.getString("type")
        ? interaction.options.getString("type").trim()
        : undefined;
      tradesCommands.tradeSearchWithParams(interaction, params);
    } else if (interaction.commandName === "createtrade") {
      tradesCommands.createtrade(interaction);
    } else if (interaction.commandName === "config") {
      if (await controller.hasPermissions(interaction, "bot")) {
        const guildConfig = configuration.getConfiguration(
          interaction.guildId,
          client
        );
        if (guildConfig) {
          configuration.sendConfigInfo(interaction, guildConfig);
        } else {
          await interaction.reply("Bot is not configured in this discord");
        }
      } else {
        await interaction.reply(
          "You do not have permissions to use this command"
        );
      }
    } else if (interaction.commandName === "configupdate") {
      if (await controller.hasPermissions(interaction, "bot")) {
        configuration.updateConfig(interaction);
      } else {
        await interaction.reply(
          "You do not have permissions to use this command"
        );
      }
    } else if (interaction.commandName === "linkserver") {
      if (await controller.hasPermissions(interaction, "bot")) {
        clanCommands.linkserver(interaction);
      } else {
        await interaction.reply(
          "You do not have permissions to use this command"
        );
      }
    } else if (
      interaction.commandName === "createsettlerslist" ||
      interaction.commandName === "createalliancelist" ||
      interaction.commandName === "createenemylist"
    ) {
      if (await controller.hasPermissions(interaction, "diplomacy")) {
        clanCommands.createDiplomacyList(interaction);
      } else {
        await interaction.reply(
          "You do not have permissions to use this command"
        );
      }
    } else if (interaction.commandName === "skilltree") {
      techCommands.getWhoHasLearntIt(interaction);
    } else if (interaction.commandName === "learned") {
      techCommands.addTech(interaction);
    }
  } catch (e) {
    console.log(e);
    logger.error(e);
  }
};

controller.hasPermissions = async (interaction, permission = "bot") => {
  return (
    interaction.member.permissions.has("ADMINISTRATOR") ||
    (await clanPermissions.userHasPermissions(
      interaction.guildId,
      interaction.member.id,
      permission
    ))
  );
};

module.exports = controller;
