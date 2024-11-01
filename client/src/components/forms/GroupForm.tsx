import { createConversation, getAllUser, uploadFile } from "@/actions/form";
import LoadingButton from "@/components/ui/LoadingButton.tsx";
import { EToastType } from "@/definitions/enums";
import {
  IChipItem,
  IConversation,
  IFileInterface,
  IUser,
} from "@/definitions/interfaces";
import { useAppDispatch, useAppSelector } from "@/hook";
import groupValidationSchema from "@/schemas/groupValidationSchema";
import { useEffect, useState } from "react";
import FileInput from "../inputs/FileInput";
import GroupImageInput from "../inputs/GroupImageInput";
import { showToaster } from "../toasts/Toaster";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import UserChip from "../chip/UserChip";
import {
  addConversation,
  setInteractionData,
  setInteractionMessages,
} from "@/features/chatSlice";
import { useFormik } from "formik";

let fileData: IFileInterface | null = null;

interface IProps {
  handleModalClose: () => void;
}

const GroupForm = ({ handleModalClose }: IProps) => {
  const [selectedUsers, setSelectedUsers] = useState<IChipItem[] | null>(null);

  const [users, setUsers] = useState<IUser[] | null>(null);
  const [filteredUsers, setFilteredUsers] = useState<IUser[] | null>(null);

  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const conversations = useAppSelector((state) => state.chat.conversations);

  const initialValues = { name: "", description: "", participants: [] };

  const setFileData = (file: IFileInterface[]) => {
    fileData = file.length ? file[0] : null;
  };

  const onSubmit = async (values: { name: string; description: string }) => {
    debugger;
    const groupCreationData: IConversation = {
      name: "",
      description: "",
      creator: "",
      image: undefined,
      participants: [],
      isGroup: true,
    };

    if (fileData) {
      // upload file to online storage
      const uploadFileResult = await uploadFile(fileData);
      if (uploadFileResult?.data) {
        const groupImageData = {
          url: uploadFileResult.data?.fileMetadata?.secure_url ?? "",
          filename: fileData?.name ?? "",
          publicId: uploadFileResult.data?.fileMetadata?.public_id ?? "",
          fileDataId: uploadFileResult.data?._id?.toString() ?? "",
        };
        groupCreationData.image = groupImageData;
      }
    }
    groupCreationData.participants =
      selectedUsers?.map((user) => user.id as string) ?? [];
    groupCreationData.participants.push(currentUser?._id as string);
    groupCreationData.name = values.name;
    groupCreationData.description = values.description;
    groupCreationData.creator = currentUser?._id || "";

    try {
      const createdGroupData = await createConversation(groupCreationData);
      if (createdGroupData?.data?._id) {
        showToaster(EToastType.Success, "Group created successfully");
        const conversation = createdGroupData.data;
        const participants = (users || [])?.filter((user) =>
          conversation.participants.includes(user._id)
        );
        conversation.participants = [currentUser, ...participants];
        dispatch(addConversation(conversation));
        dispatch(setInteractionData({ user: null, conversation }));
        dispatch(setInteractionMessages([]));
        handleModalClose?.();
      }
    } catch (error: any) {
      showToaster(
        EToastType.Error,
        `Error creating group: ${error?.message || "Something went wrong"}`
      );
    }
  };

  const formik = useFormik({
    initialValues,
    validationSchema: groupValidationSchema,
    onSubmit: onSubmit,
  });

  const { errors, touched, setFieldValue } = formik;

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
      setFieldValue("participants", participantsId);
      setFilteredUsers(
        (filteredUsers || [])?.filter((user) => user._id !== selectedUser._id)
      );
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
      setFieldValue("participants", participantsId);
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
        onSubmit={formik.handleSubmit}
      >
        <div className="flex-center gap-8">
          <FileInput
            acceptedFileTypes={["image/png", "image/jpeg", "image/*"]}
            RenderComponent={GroupImageInput}
            setFiles={setFileData}
            classes="w-2/5"
          />
          <div className="flex-col flex gap-4">
            <div className="form-group">
              <input
                name="name"
                className="input"
                placeholder={"Group name"}
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {errors.name && touched.name ? (
                <div className="error-field">{errors.name}</div>
              ) : null}
            </div>
            <div className="form-group">
              <textarea
                name="description"
                className="input"
                placeholder={"About group "}
                rows={3}
                style={{ resize: "none" }}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {errors.description && touched.description ? (
                <div className="error-field">{errors.description}</div>
              ) : null}
            </div>
          </div>
        </div>

        {/* selected users list */}
        {!!selectedUsers?.length && (
          <div className="flex flex-col gap-4 sm:h-3/4 h-60 overflow-auto sm:max-w-[500px]">
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

            {errors.participants && touched.participants ? (
              <div className="error-field mt-1">{errors.participants}</div>
            ) : null}
          </div>
        )}
        <LoadingButton
          type="submit"
          form="group-form"
          className="button"
          disabled={formik.isSubmitting || !formik.isValid}
          isLoading={formik.isSubmitting}
        >
          Create group
        </LoadingButton>
      </form>
    </div>
  );
};

export default GroupForm;
