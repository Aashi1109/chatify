import { createGroup, getAllUser, uploadFile } from "@/actions/form";
import { EToastType } from "@/definitions/enums";
import {
  ChipItemI,
  IFileInterface,
  IGroups,
  IUser,
} from "@/definitions/interfaces";
import groupValidationSchema from "@/schemas/groupValidationSchema";
import { getToken } from "@/utils/generalHelper";
import { Field, Form, Formik } from "formik";
import { useEffect, useRef, useState } from "react";
import UserSelectChip from "../chip/UserSelectChip";
import FileInput from "../inputs/FileInput";
import GroupImageInput from "../inputs/GroupImageInput";
import { showToaster } from "../toasts/Toaster";

let fileData: IFileInterface | null = null;
const GroupForm = () => {
  const [selectedUsers, setSelectedUsers] = useState<ChipItemI[] | null>(null);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [users, setUsers] = useState<IUser[] | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const userId = null;

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
    groupCreationData.creatorId = userId!;
    // create group
    const token = getToken();
    const createdGroupData = await createGroup(token!, groupCreationData);

    if (createdGroupData?.success) {
      showToaster({
        toastText: "Group created successfully",
        toastType: EToastType.Success,
      });

      // close modal
      // TODO close modal and route to new group
    } else {
      showToaster({
        toastText: createdGroupData?.message || "Group creation failed",
        toastType: EToastType.Error,
      });
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
    // code to fetch users
    const token = getToken();
    if (token) {
      getAllUser(token, userId).then((data) => {
        if (data && data?.length > 0) {
          setUsers(data);
          // setFilteredUsers(data);
        }
      });
    }

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
    <div className="modal-form max-h-[90vh] overflow-y-scroll flex-grow-0">
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <p className="text-xl">New chat</p>
          <p
            className="text-3xl cursor-pointer"
            // onClick={() => {
            //   toogleModal();
            //   updateQueryString(searchParams, "interactionId", "", "remove");
            // }}
          >
            &times;
          </p>
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
            {({ touched, errors, isSubmitting }) => (
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
        <button
          type="submit"
          form="group-form"
          className="button"
          ref={buttonRef}
          disabled={isFormSubmitting}
        >
          Create group
        </button>
      </div>
    </div>
  );
};

export default GroupForm;
