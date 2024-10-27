import { dateFormat } from "./dateFormat";

export const generateQuoteMsgs = (quote, currentUserId) => {
  let messages = {};
  switch (quote.type) {
    case "reviewtask":
      messages = {
        user: `${quote.sender.name} has submitted the task, waiting your review.`,
        provider: `You have submitted the task, waiting for ${quote.receiver.name} to review.`,
      };
      break;
    case "ratings":
      if (quote.sender.id == quote.provider.id) {
        messages = {
          user: `${quote.sender.username} has rated you ad left a review.`,
          provider: `You have rated ${quote.receiver.username} ad left a review.`,
        };
      } else if (quote.sender.id !== quote.provider.id) {
        messages = {
          provider: `${quote.sender.username} has rated you and left a review.`,
          user: `You have rated ${quote.receiver.username} and left a review.`,
        };
      }
      break;
    case "released":
      messages = {
        provider: `${quote.sender.username} has released $${quote.amount} to you.`,
        user: `You have released $${quote.amount} to ${quote.receiver.username}.`,
      };
      break;
    case "rejected":
      quote.provider = quote.sender;
      if (currentUserId == quote.sender?.id) {
        messages = {
          provider: `You rejected the quote for ${quote.service.value},\n from ${quote.sender.username}`,
          user: `${quote.sender.username} has rejected your quote for ${quote.service.value},\n Reason: ${quote.message}`,
        };
      } else {
        messages = {
          provider: `${quote.receiver.username} has rejected your quote for ${quote?.service?.value},\n Reason: ${quote.message}`,
          user: `${quote.sender.username} has rejected your quote for ${quote.service.value},\n Reason: ${quote.message}`,
        };
      }
      break;
    case "quote":
      if (quote.status == "pending" || quote.status == "void") {
        if (quote.slot) {
          messages = {
            provider: `${quote.sender.username} has sent an offer for ${
              quote.service.value
            } on ${dateFormat(quote?.date.seconds * 1000)} from ${
              quote.slot.from
            } to ${quote.slot.to} for $${quote.quote}`,
            user: `You have requested a quote from ${
              quote.receiver.username
            } for ${quote.service.value} on ${dateFormat(
              quote?.date.seconds * 1000
            )} from ${quote.slot.from} to ${quote.slot.to}`,
          };
        } else {
          messages = {
            provider: `${quote.sender.username} has sent an offer for ${
              quote.service.value
            } on ${dateFormat(quote?.date.seconds * 1000)} for $${quote.quote}`,
            user: `You have requested a quote from ${
              quote.receiver.username
            } for ${quote.service.value} on ${dateFormat(
              quote?.date.seconds * 1000
            )}.`,
          };
        }
      }
      if (quote.status == "accepted") {
        if(quote.slot) {
          messages = {
            provider: `You have successfully accepted the offer,we will let you know when ${quote.client.name} will put money in escrow  for you to start working.`,
            user: `Your offer has been accepted for ${
              quote.service.value
            } on ${dateFormat(quote?.date.seconds * 1000)} from ${
              quote.slot.from
            } to ${quote.slot.to}`,
          };
        } else {
          messages = {
            provider: `You have successfully accepted the offer,we will let you know when ${quote.client.name} will put money in escrow  for you to start working.`,
            user: `Your offer has been accepted for ${
              quote.service.value
            } on ${dateFormat(quote?.date.seconds * 1000)}`,
          };
        }
      } else if (quote.status == "rejected") {
        if (currentUserId == quote.provider?.id) {
          messages = {
            provider: `You rejected the quote for ${quote.service.value},\n from ${quote.sender.username}`,
            user: `${quote.sender.username} has rejected your quote for ${quote.service.value},\n Reason: ${quote.message}`,
          };
        } else {
          messages = {
            provider: `${quote.receiver.username} has rejected your quote for ${quote.service.value},\n Reason: ${quote.message}`,
            user: `Quote rejected successfully`,
          };
        }
      } else if (quote.status == "completed") {
        messages = {
          provider: `Task Completed successfully`,
          user: `Task Completed successfully`,
        };
      } else if (quote.status == "progress") {
        messages = {
          provider: `${quote?.client?.name} has put money on escrow, you can now start the task`,
          user: `You have put money on escrow, task is in progress`,
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
  if (quote.provider?.id === currentUserId) {
    return messages.provider;
  } else if (quote.provider?.id !== currentUserId) {
    return messages.user;
  }
};
