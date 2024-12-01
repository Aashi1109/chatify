import { useAppDispatch, useAppSelector } from "@/hook";
import { useForm } from "react-hook-form";

import CircleAvatar from "../CircleAvatar";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { AtSign, Edit3Icon, UserCircle2 } from "lucide-react";
import LoadingButton from "../ui/LoadingButton";
import { useEffect, useState } from "react";
import { updatePassword, updateUser } from "@/actions/form";
import { showToaster } from "../toasts/Toaster";
import { EToastType } from "@/definitions/enums";
import { setAuth } from "@/features/authSlice";
import PasswordInput from "../inputs/PasswordInput";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

const Profile = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);

  const [isPasswordChangeOpen, setIsPasswordChangeOpen] = useState(false);
  const [isChanged, setIsChanged] = useState(false);

  const joinedOn = new Date(currentUser!.createdAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    clearErrors,
    watch,
  } = useForm({
    defaultValues: {
      name: currentUser?.name,
      username: currentUser?.username,
      about: currentUser?.about,
      isAboutEditing: false,
      oldPassword: "",
      confirmPassword: "",
      newPassword: "",
    },
  });

  const allValues = watch();

  const handleOpenPasswordChange = () => {
    setIsPasswordChangeOpen((prev) => !prev);
    clearErrors(["newPassword", "confirmPassword", "oldPassword"]);
  };

  const handlePasswordUpdate = async () => {
    handleSubmit(async () => {
      try {
        const updateResult = await updatePassword(
          currentUser?._id || "",
          allValues?.oldPassword,
          allValues?.newPassword
        );

        if (updateResult.success) {
          handleOpenPasswordChange();
          showToaster(EToastType.Success, "Password updated successfully");
        }
      } catch (error: any) {
        console.error(`Error updating password`, error);
        showToaster(
          EToastType.Error,
          error.message || "Error updating password"
        );
      }
    })();
  };

  const onSubmit = async (data: any) => {
    try {
      const updateResult = await updateUser(currentUser?._id || "", {
        name: data.name,
        username: data.username,
        about: data.about,
      });

      if (updateResult.success) {
        showToaster(EToastType.Success, "Profile updated successfully");
        // TODO Emit event of user update to all users
        dispatch(
          setAuth({
            user: updateResult.data,
          })
        );
      }
    } catch (error) {
      showToaster(EToastType.Error, "Failed to update profile");
      console.error("Error updating profile : ", error);
    }
  };

  useEffect(() => {
    setIsChanged(() => {
      return (
        allValues.name !== currentUser?.name ||
        allValues.username !== currentUser?.username ||
        allValues.about !== currentUser?.about
      );
    });
  }, [allValues, currentUser]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start flex-col gap-1">
        <p className="text-lg font-semibold">
          {currentUser?.name.split(" ")?.[0]}'s Profile
        </p>
        <p className="text-sm text-gray-500">
          Make changes to your profile here. Click save when you're done.
        </p>
      </div>
      {/* image , name and username */}
      <div className="flex-start gap-4">
        <CircleAvatar
          imageUrl={currentUser?.profileImage.url || ""}
          fallback={currentUser?.name?.[0]?.toLocaleUpperCase() || ""}
          alt={currentUser?.name || ""}
          classes="w-20 h-20"
        />
        <div className="flex-center flex-col gap-2 flex-1">
          <div className="relative w-full  form-group">
            <Input
              value={allValues?.name}
              placeholder="Name"
              className="pl-8"
              {...register("name")}
            />
            <UserCircle2 className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-2" />
            {errors.name && (
              <p className="error-field">{errors.name.message}</p>
            )}
          </div>
          <div className="relative w-full form-group">
            <Input
              value={allValues?.username}
              placeholder="Unique username"
              className="pl-8"
              {...register("username", {
                validate: (value) => {
                  if (!value) return "Username is required";
                  return true;
                },
              })}
            />
            <AtSign className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-2" />
            {errors.username && (
              <p className="error-field">{errors.username.message}</p>
            )}
          </div>
        </div>
      </div>

      <p className="text-sm">Joined on {joinedOn}</p>
      <div className="flex flex-col  form-group">
        <div>
          <p className="text-sm">About</p>
          <div className="w-8 h-[1px] bg-gray-300" />
        </div>
        {allValues?.about || allValues?.isAboutEditing ? (
          <Textarea value={allValues?.about} {...register("about")} />
        ) : (
          <p className="text-xs italic">
            Oops! Looks like nothing is added yet here.{" "}
            <span
              className="text-2xs not-italic underline cursor-pointer"
              onClick={() => setValue("isAboutEditing", true)}
            >
              Add something here
            </span>
          </p>
        )}
        {errors.about && <p className="error-field">{errors.about.message}</p>}
      </div>

      <div className="flex flex-col">
        <div className="flex-between">
          <p className="text-sm">Change Password</p>
          {isPasswordChangeOpen ? (
            <div className="flex-center gap-4">
              <Button
                variant={"outline"}
                size={"xs"}
                onClick={handleOpenPasswordChange}
              >
                Cancel
              </Button>
              <LoadingButton size={"xs"} onClick={handlePasswordUpdate}>
                Update
              </LoadingButton>
            </div>
          ) : (
            <Edit3Icon
              className="w-4 h-4 cursor-pointer"
              onClick={handleOpenPasswordChange}
            />
          )}
        </div>
        <div
          className={cn(
            "flex flex-col gap-4 w-full max-h-0 transition-[max-height] duration-300 ease-out overflow-hidden",
            {
              "max-h-40 mt-4 overflow-auto": isPasswordChangeOpen,
            }
          )}
        >
          <PasswordInput
            register={register}
            errors={errors}
            name="oldPassword"
            showConfirmPassword={false}
            placeholder="Enter old password"
          />
          <PasswordInput
            register={register}
            errors={errors}
            name="newPassword"
            placeholder="Enter new password"
          />
        </div>
      </div>

      <LoadingButton
        disabled={Object.keys(errors).length > 0 || isSubmitting || !isChanged}
        onClick={handleSubmit(onSubmit)}
      >
        Save Changes
      </LoadingButton>
    </div>
  );
};

export default Profile;
