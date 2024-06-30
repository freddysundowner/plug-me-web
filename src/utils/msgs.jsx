import { dateFormat } from "./dateFormat";

export const generateQuoteMsgs = (quote, currentUserId) => {
  let messages = {};
  switch (quote.type) {
    case "request":
      if (quote.status == "pending") {
        messages = {
          provider: `${quote.sender.username} has requested a quote for ${
            quote.service.value
          } on ${dateFormat(quote?.date.seconds * 1000)} from ${
            quote.slot.from
          } to ${quote.slot.to}`,
          user: `You have requested a quote from ${
            quote.receiver.username
          } for ${quote.service.value} on ${dateFormat(
            quote?.date.seconds * 1000
          )} from ${quote.slot.from} to ${quote.slot.to}`,
        };
      } else if (quote.status == "rejected") {
        messages = {
          provider: `You have rejected the quote from ${
            quote.sender.username
          } for ${quote.service.value} on ${dateFormat(
            quote?.date.seconds * 1000
          )} from ${quote.slot.from} to ${quote.slot.to}`,
          user: `${quote.receiver.username} has rejected your quote request for ${quote.service.value},\n Reason: ${quote.message}`,
        };
      }
      break;
      //   messages = {
      //     provider: `${quote.sender.username} has requested a quote for ${
      //       quote.service.value
      //     } on ${dateFormat(quote?.date.seconds * 1000)} from ${
      //       quote.slot.from
      //     } to ${quote.slot.to}`,
      //     user: `You have requested a quote from ${quote.receiver.username} for ${
      //       quote.service.value
      //     } on ${dateFormat(quote?.date.seconds * 1000)} from ${
      //       quote.slot.from
      //     } to ${quote.slot.to}`,
      //   };
      break;
    case "quote":
      if (quote.status == "accepted") {
        messages = {
          provider: `Quote submitted successfully`,
          user: `You have received a quote for ${
            quote.service.value
          } on ${dateFormat(quote?.date.seconds * 1000)} from ${
            quote.slot.from
          } to ${quote.slot.to}`,
        };
      } else if (quote.status == "rejected") {
        if (
          quote.rejectedBy == currentUserId &&
          currentUserId == quote.provider
        ) {
          messages = {
            provider: `You rejected the quote for ${quote.service.value},\n Reason: ${quote.message}`,
            user: `${quote.sender.username} has rejected your quote for ${quote.service.value},\n Reason: ${quote.message}`,
          };
        } else {
          messages = {
            provider: `${quote.receiver.username} has rejected your quote for ${quote.service.value},\n Reason: ${quote.message}`,
            user: `Quote rejected successfully`,
          };
        }
      } else if (quote.status == "pending") {
        messages = {
          provider: `Quote submitted successfully`,
          user: `You have received a quote for ${
            quote.service.value
          } on ${dateFormat(quote?.date.seconds * 1000)} from ${
            quote.slot.from
          } to ${quote.slot.to}`,
        };
      }
      break;

    default:
      messages = {
        provider: quote.message,
        user: quote.message,
      };
      break;
  }
  if (quote.provider === currentUserId) {
    return messages.provider;
  } else if (quote.provider !== currentUserId) {
    return messages.user;
  }
};
