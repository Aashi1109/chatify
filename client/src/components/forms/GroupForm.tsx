import { createGroup, getAllUser, uploadFile } from "@/actions/form";
import LoadingButton from "@/components/ui/LoadingButton.tsx";
import { EToastType } from "@/definitions/enums";
import {
  ChipItemI,
  IFileInterface,
  IGroups,
  IUser,
} from "@/definitions/interfaces";
import { useAppDispatch, useAppSelector } from "@/hook";
import groupValidationSchema from "@/schemas/groupValidationSchema";
import { Field, Form, Formik } from "formik";
import { useEffect, useRef, useState } from "react";
import UserSelectChip from "../chip/UserSelectChip";
import FileInput from "../inputs/FileInput";
import GroupImageInput from "../inputs/GroupImageInput";
import { showToaster } from "../toasts/Toaster";

let fileData: IFileInterface | null = null;

const GroupForm = () => {
  const [selectedUsers, setSelectedUsers] = useState<ChipItemI[] | null>(null);
  const [users, setUsers] = useState<IUser[] | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);

  const setFileData = (file: IFileInterface[]) => {
    fileData = file.length ? file[0] : null;
  };

  const handleSubmit = async (values: {
    name: string;
    description: string;
  }) => {
    const groupCreationData: IGroups = {
      name: "",
      description: "",
      creatorId: "",
      image: {
        url: "",
        filename: "",
        publicId: "",
        fileDataId: "",
      },
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
    groupCreationData.users =
      selectedUsers?.map((user) => user.id as string) ?? [];
    groupCreationData.name = values.name;
    groupCreationData.description = values.description;
    groupCreationData.creatorId = currentUser?._id;
    // create group
    const createdGroupData = await createGroup(groupCreationData);

    if (createdGroupData?.success) {
      showToaster(EToastType.Success, "Group created successfully");

      // close modal
      // TODO close modal and route to new group
    } else {
      showToaster(
        EToastType.Error,
        createdGroupData?.message || "Group creation failed"
      );
    }
  };

  const handleSelectedUser = (selectedUser: ChipItemI) => {
    // check if the user is already selected
    const isUserSelected = selectedUsers?.some(
      (user) => user.id === selectedUser.id
    );

    if (!isUserSelected) {
      if (selectedUsers) {
        setSelectedUsers((prevState) => [...prevState!, selectedUser]);
      } else {
        setSelectedUsers([selectedUser]);
      }
    }
  };

  // fetch users's list from backend
  useEffect(() => {
    getAllUser(currentUser?._id).then((data) => {
      if (data && data?.length > 0) {
        setUsers(data);
        // setFilteredUsers(data);
      }
    });

    return () => {
      setSelectedUsers(null);
      setUsers(null);
    };
  }, []);

  const handleSelectedItemChipClick = (id: string) => {
    if (selectedUsers) {
      setSelectedUsers(selectedUsers.filter((user) => user.id !== id));
    }
  };

  const initialValues = { name: "", description: "" };
  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <p className="text-xl">Create group</p>
      </div>
      <div className="flex flex-col sm:flex-row justify-center items-center gap-8">
        {/* TODO image input container */}
        <FileInput
          acceptedFileTypes={["image/png", "image/jpeg", "image/*"]}
          RenderComponent={GroupImageInput}
          setFiles={setFileData}
          classes="w-2/5"
        />

        <Formik
          initialValues={initialValues}
          onSubmit={handleSubmit}
          validationSchema={groupValidationSchema}
        >
          {({ touched, errors }) => (
            <Form
              className="flex flex-col gap-4 w-full sm:w-3/5"
              id="group-form"
            >
              <div className="form-group">
                <Field
                  name="name"
                  className="input"
                  placeholder={"Group name"}
                />
                {errors.name && touched.name ? (
                  <div className="error-field">{errors.name}</div>
                ) : null}
              </div>
              <div className="form-group">
                <Field
                  name="description"
                  className="input"
                  as="textarea"
                  placeholder={"About group "}
                  rows={3}
                  style={{ resize: "none" }}
                />
                {errors.description && touched.description ? (
                  <div className="error-field">{errors.description}</div>
                ) : null}
              </div>
            </Form>
          )}
        </Formik>
      </div>

      {/* selected users list */}
      {selectedUsers && (
        <div className="flex flex-col gap-4 max-h-60 overflow-auto sm:max-w-[500px]">
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
                  onClick={() => handleSelectedItemChipClick(user.id as string)}
                >
                  &times;
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* unselected users list */}
      {users && (
        <div className="flex flex-col gap-4">
          <p>Available users</p>
          <div className="max-h-60 overflow-auto flex flex-col gap-2">
            {users.map((user) => (
              <UserSelectChip
                user={user}
                key={user._id}
                handleChipItemClick={handleSelectedUser}
              />
            ))}
          </div>
        </div>
      )}
      <LoadingButton
        type="submit"
        form="group-form"
        className="button"
        disabled={isFormSubmitting}
        isLoading={isFormSubmitting}
        ref={buttonRef}
      >
        Create group
      </LoadingButton>
    </div>
  );
};

export default GroupForm;
