import { ClientError, UnauthorizedError } from "@exceptions";
import { getJWTPayload } from "@lib/helpers";
import { User } from "@models";

const socketUserParser = async (socket, next) => {
  const cookies = socket.request.headers?.cookie;
  const jwtCookie = cookies
    ?.split(";")
    .find((c) => c.trim().startsWith("jwt="))
    ?.split("=")[1];

  let err;
  if (!jwtCookie) err = new ClientError(`Missing token`);
  try {
    const { _id, username } = (await getJWTPayload(jwtCookie)) || {};

    if (!_id && !username)
      err = new UnauthorizedError(`Forbidden: Insufficient permissions`);
    const user = await User.findOne({ _id, username });

    if (!user)
      err = new UnauthorizedError(`Forbidden: Insufficient permission`);

    next(err);
    socket.request.user = user;
  } catch (error) {
    next(new UnauthorizedError(`Forbidden: Insufficient permissions`));
  }
};

export default socketUserParser;
