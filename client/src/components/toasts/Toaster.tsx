import { EToastType } from "@/definitions/enums";
import clsx from "clsx";
import { toast } from "react-toastify";

const Toaster = ({
  toastType,
  toastText,
}: // closeToast,
{
  toastType: EToastType;
  toastText: string;
  // closeToast: () => void;
}) => {
  const getToastHeadText = (toastType: EToastType) => {
    switch (toastType) {
      case EToastType.Success:
        return "Success";
      case EToastType.Error:
        return "Error";
      case EToastType.Warning:
        return "Warning";
      case EToastType.Info:
        return "Info";
      default:
        return "Info";
    }
  };
  return (
    <div className="flex-1 w-full h-full p-2 rounded-lg flex gap-4 max-w-80 bg-white relative overflow-y-auto">
      <div
        className={clsx(
          {
            "bg-green-700": toastType == EToastType.Success,
            "bg-[--danger-hex]": toastType === EToastType.Error,
            "bg-blue-700": toastType === EToastType.Info,
            "bg-orange-300": toastType === EToastType.Warning,
          },
          "rounded-full w-[6px]"
        )}
      ></div>
      <div className="flex flex-col justify-around py-1">
        <p
          className={clsx(
            {
              "text-green-700": toastType == EToastType.Success,
              "text-[--danger-hex]": toastType === EToastType.Error,
              "text-blue-700": toastType === EToastType.Info,
              "text-orange-300": toastType === EToastType.Warning,
            },
            "font-bold text-lg"
          )}
        >
          {getToastHeadText(toastType)}
        </p>

        <p className="text-black">{toastText}</p>
      </div>
    </div>
  );
};

export const showToaster = (toastType: EToastType, toastText: string) =>
  toast(<Toaster toastText={toastText} toastType={toastType} />, {});

export default Toaster;
