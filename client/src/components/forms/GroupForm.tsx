import { createConversation, getAllUser, uploadFile } from "@/actions/form";
import LoadingButton from "@/components/ui/LoadingButton.tsx";
import { EConversationTypes, EToastType } from "@/definitions/enums";
import {
  IChipItem,
  IConversation,
  IFile,
  IFileInterface,
  IUser,
} from "@/definitions/interfaces";
import { useAppDispatch, useAppSelector } from "@/hook";
import groupValidationSchema from "@/schemas/groupValidationSchema";
import { useEffect, useRef, useState } from "react";
import FileInput from "../inputs/FileInput";
import GroupImageInput from "../inputs/GroupImageInput";
import { showToaster } from "../toasts/Toaster";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import UserChip from "../chip/UserChip";
import { addConversation, setInteractionData } from "@/features/chatSlice";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

let fileData: IFileInterface | null = null;

interface IProps {
  handleModalClose: () => void;
}

const GroupForm = ({ handleModalClose }: IProps) => {
  const [selectedUsers, setSelectedUsers] = useState<IChipItem[] | null>(null);
  const previousFileData = useRef<IFile | null>(null);

  const [users, setUsers] = useState<IUser[] | null>(null);
  const [filteredUsers, setFilteredUsers] = useState<IUser[] | null>(null);

  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const conversations = useAppSelector((state) => state.chat.conversations);

  const initialValues = { name: "", description: "", participants: [] };

  const setFileData = (file: IFileInterface[]) => {
    fileData = file.length ? file[0] : null;
    fileData && (previousFileData.current = null);
  };

  const onSubmit = async (data: any) => {
    const groupCreationData: IConversation = {
      name: "",
      description: "",
      creator: "",
      image: undefined,
      participants: [],
      type: EConversationTypes.GROUP,
    };
    try {
      if (fileData) {
        // upload file to online storage

        previousFileData.current ??= (await uploadFile(fileData))?.data;
        if (previousFileData.current) {
          const groupImageData = {
            url: previousFileData.current?.fileMetadata?.secure_url ?? "",
            filename: fileData?.name ?? "",
            publicId: previousFileData.current?.fileMetadata?.public_id ?? "",
            fileDataId: previousFileData.current?._id?.toString() ?? "",
          };
          groupCreationData.image = groupImageData;
        }
      }
      groupCreationData.participants =
        selectedUsers?.map((user) => user.id as string) ?? [];
      groupCreationData.participants.push(currentUser?._id as string);
      groupCreationData.name = data?.name;
      groupCreationData.description = data?.description;
      groupCreationData.creator = currentUser?._id || "";

      const createdGroupData = await createConversation(groupCreationData);
      if (createdGroupData?.data?._id) {
        showToaster(EToastType.Success, "Group created successfully");
        const conversation = createdGroupData.data;
        const participants = (users || [])?.filter((user) =>
          conversation.participants.includes(user._id)
        );
        conversation.participants = [currentUser, ...participants];
        dispatch(addConversation(conversation));
        dispatch(
          setInteractionData({
            conversationData: { user: null, conversation },
            closeChatWindow: false,
          })
        );
        handleModalClose?.();
      }
    } catch (error: any) {
      showToaster(
        EToastType.Error,
        `Error creating group: ${error?.message || "Something went wrong"}`
      );
    }
  };

  const {
    register,
    formState: { errors, isSubmitting, isValid },
    clearErrors,
    setValue,
    handleSubmit,
  } = useForm({
    defaultValues: initialValues,
    resolver: yupResolver(groupValidationSchema),
  });

  const handleSelectedUser = (selectedUser: IUser) => {
    const isUserSelected = selectedUsers?.find(
      (user) => user.id === selectedUser._id
    );

    if (!isUserSelected) {
      const newSelectedUsers = [
        ...(selectedUsers || []),
        { id: selectedUser._id!, text: selectedUser.name },
      ];
      setSelectedUsers(newSelectedUsers);
      const participantsId = newSelectedUsers.map((user) => user.id);
      setValue("participants", participantsId as string[]);
      setFilteredUsers(
        (filteredUsers || [])?.filter((user) => user._id !== selectedUser._id)
      );
      clearErrors("participants");
    }
  };

  // fetch users's list from backend
  useEffect(() => {
    getAllUser(currentUser?._id).then(({ data }) => {
      if (data && data?.length > 0) {
        const filteredUsers = data.filter((user: IUser) => {
          const existingConversation = conversations?.find(
            (f) => f._id === user._id
          );

          return !existingConversation;
        });
        setUsers(filteredUsers);
        setFilteredUsers(data);
      }
    });

    return () => {
      setSelectedUsers(null);
      setFilteredUsers(null);
      setUsers(null);
    };
  }, []);

  const handleSelectedItemChipClick = (id: string) => {
    if (selectedUsers) {
      const newSelectedUsers = selectedUsers.filter((user) => user.id !== id);
      setSelectedUsers(newSelectedUsers);

      const participantsId = newSelectedUsers.map((user) => user.id);
      setValue("participants", participantsId as string[]);
      const userData = users?.find((user) => user._id === id);
      if (userData) {
        setFilteredUsers([userData, ...(filteredUsers || [])]);
      }
    }
  };

  const _SubmitButton = ({ user }: { user: IUser }) => (
    <Button
      onClick={() => handleSelectedUser(user)}
      className="px-2 text-center"
      size={"sm"}
    >
      <Plus className={"w-4 h-4"} />
      <span>Add</span>
    </Button>
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <p className="text-xl">Create group</p>
      </div>

      <form
        className="flex flex-col gap-4 w-full"
        id="group-form"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex-center gap-8">
          <FileInput
            acceptedFileTypes={[
              "image/png",
              "image/jpeg",
              "image/*",
              "image/webp",
            ]}
            RenderComponent={GroupImageInput}
            setFiles={setFileData}
            classes="w-2/5"
          />
          <div className="flex-col flex gap-4">
            <div className="form-group">
              <input
                className="input"
                placeholder={"Group name"}
                {...register("name")}
              />
              {errors.name ? (
                <div className="error-field">{errors.name.message}</div>
              ) : null}
            </div>
            <div className="form-group">
              <textarea
                className="input"
                placeholder={"About group "}
                rows={3}
                style={{ resize: "none" }}
                {...register("description")}
              />
              {errors.description ? (
                <div className="error-field">{errors.description.message}</div>
              ) : null}
            </div>
          </div>
        </div>

        {/* selected users list */}
        {!!selectedUsers?.length && (
          <div className="flex flex-col gap-4 max-h-52 overflow-auto sm:max-w-[500px]">
            <p>Users to add</p>
            {/* TODO render list of selected users */}
            <div className="flex flex-wrap gap-4 flex-grow-0">
              {selectedUsers.map((user) => (
                <div
                  className="inline-flex rounded-full px-4 py-0 border bg-gray-600 items-center justify-center"
                  key={user.id}
                >
                  <p>{user.text}</p>
                  <p
                    className="ml-2 text-2xl mt--3 cursor-pointer"
                    onClick={() =>
                      handleSelectedItemChipClick(user.id as string)
                    }
                  >
                    &times;
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* unselected users list */}
        {!!filteredUsers?.length && (
          <div>
            <div className="flex flex-col gap-4">
              <p>Available users</p>
              <div className="max-h-60 overflow-auto flex flex-col gap-2">
                {filteredUsers.map((user) => (
                  <UserChip user={user} key={user._id} Button={_SubmitButton} />
                ))}
              </div>
            </div>

            {errors.participants ? (
              <div className="error-field mt-1">
                {errors.participants.message}
              </div>
            ) : null}
          </div>
        )}
        <LoadingButton
          type="submit"
          form="group-form"
          className="button"
          disabled={isSubmitting || Object.keys(errors).length > 0}
          isLoading={isSubmitting}
        >
          Create group
        </LoadingButton>
      </form>
    </div>
  );
};

export default GroupForm;
