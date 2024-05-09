"use client";
import { Field, Form, Formik } from "formik";
import { useEffect, useState } from "react";
import * as Yup from "yup";

let fileData = null;
const GroupForm: React.FC<{}> = () => {
  const groupValidationSchemaC = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    description: Yup.string().optional(),
  });
  const setFIleData = (file) => {
    fileData = { ...file };
  };

  const handleSubmit = (values) => {
    const groupCreationData = {
      name: "",
      description: "",
      users: [],
      createdBy: "",
    };
  };

  const [selectedUsers, setSelectedUsers] = useState<IChipItem[] | null>(null);
  const [users, setUsers] = useState<IUsers[] | null>(null);

  // fetch users's list from backend
  useEffect(() => {
    // code to fetch users

    return () => {
      setSelectedUsers(null);
      setUsers(null);
    };
  }, []);

  const initialValues = { name: "", description: "" };
  return (
    <div className="bg-[--primary-hex] w-[400px] sm:w-[500px] flex">
      <p>New group</p>
      <div className="flex sm:flex-col justify-center items-center gap-8 sm:gap-4">
        {/* TODO image input container */}

        <Formik initialValues={initialValues} onSubmit={(values) => {}}>
          {({ touched, errors }) => (
            <Form className="flex">
              <div className="form-group">
                <Field name="name" className="input" />
                {errors.name && touched.name ? (
                  <div className="error-text">{errors.name}</div>
                ) : null}
              </div>
              <div className="form-group">
                <Field name="description" className="input" type="textarea" />
                {errors.description && touched.description ? (
                  <div className="error-text">{errors.description}</div>
                ) : null}
              </div>

              {/* selected users list */}
              {selectedUsers && (
                <div className="">
                  <p>Users to add</p>
                  {/* TODO render list of selected users */}
                </div>
              )}

              {/* unselected users list */}

              <button type="submit">Create group</button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default GroupForm;