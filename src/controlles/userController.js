import { User } from "../models/Users.js";

const getNotification = async (req, res) => {
  try {
    const notifications = await User.findOne(
      { clerk_Id: req.params.userId },
      { notifications: 1 }
    );
    const NotSeenCount = notifications.notifications.reduce((acc, curr) => {
      if (!curr.seen) {
        acc.push(curr._id);
      }
      return acc;
    }, []);
    if (NotSeenCount.length > 0) {
      const updataNotSeenNotifications = await User.updateMany(
        { "notifications._id": { $in: NotSeenCount } },
        [
          {
            $set: {
              notifications: {
                $map: {
                  input: "$notifications",
                  as: "item",
                  in: {
                    $cond: {
                      if: { $in: ["$$item._id", NotSeenCount] },
                      then: { $mergeObjects: ["$$item", { seen: true }] },
                      else: "$$item",
                    },
                  },
                },
              },
            },
          },
        ]
      );
      console.log(updataNotSeenNotifications.modifiedCount);
    }

    res.status(200).json(notifications);
  } catch (error) {
    console.log(error);
  }
};

const getNotSeenNotificationsCount = async (req, res) => {
  const userId = req.params.userId;
  try {
    const notifications = await User.findOne(
      { clerk_Id: userId },
      { notifications: 1 }
    );

    const notificationsCount = notifications.notifications.reduce(
      (acc, curr) => {
        if (!curr.seen) return acc + 1;
        return acc;
      },
      0
    );
    res.status(200).json({ count: notificationsCount });
  } catch (error) {
    console.log(error);
  }
};

export { getNotification, getNotSeenNotificationsCount };
