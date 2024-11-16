import { EMessageCategory, EMessageType } from "@definitions/enums";
import { IMessage } from "@definitions/interfaces";
import { Schema, Types, model } from "mongoose";

const messageSchema = new Schema<IMessage>(
  {
    user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    content: { type: String, required: true },
    type: {
      type: String,
      enum: EMessageType,
      required: true,
      default: EMessageType.Text,
    },
    category: {
      type: String,
      enum: EMessageCategory,
      default: EMessageCategory.User,
    },
    isEdited: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Optimized method to fetch messages with their status using aggregation
messageSchema.static(
  "findWithStatus",
  async function (
    filter: {
      conversation?: Types.ObjectId;
      users?: Types.ObjectId | Types.ObjectId[];
    },
    page = 1,
    limit = 20,
    sort = { createdAt: -1 }
  ) {
    const finalFilter: any = { ...filter };

    if (filter.users) {
      finalFilter.users = Array.isArray(filter.users)
        ? { $in: filter.users }
        : filter.users;
    }

    const skip = (page - 1) * limit;

    const [results, totalCount] = await Promise.all([
      this.aggregate([
        { $match: finalFilter },
        {
          $lookup: {
            from: "messagestats",
            localField: "_id",
            foreignField: "message",
            pipeline: [
              {
                $project: {
                  user: 1,
                  readAt: 1,
                  deliveredAt: 1,
                  deletedAt: 1,
                },
              },
            ],
            as: "participantStats",
          },
        },
        {
          $addFields: {
            // Convert array of stats to object mapped by userId
            stats: {
              $arrayToObject: {
                $map: {
                  input: "$participantStats",
                  as: "stat",
                  in: {
                    k: { $toString: "$$stat.user" },
                    v: {
                      readAt: "$$stat.readAt",
                      deliveredAt: "$$stat.deliveredAt",
                      deletedAt: "$$stat.deletedAt",
                    },
                  },
                },
              },
            },
          },
        },
        { $project: { participantStats: 0 } }, // Remove the original stats array
        { $sort: sort },
        { $skip: skip },
        { $limit: limit },
      ]),

      this.countDocuments(finalFilter),
    ]);

    return {
      messages: results,
      pagination: {
        total: totalCount || 0,
        page,
        limit,
        pages: Math.ceil((totalCount || 0) / limit),
      },
    };
  }
);

const Message = model<IMessage>("Message", messageSchema);

export default Message;
