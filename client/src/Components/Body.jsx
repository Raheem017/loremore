import React, { useState } from "react";
import { Formik, Form, Field, FieldArray } from "formik";
import axios from "axios";
import CodeMirrorEditor from "./CodeMirrorEditor";

const initialValues = {
  fields: [
    { name: "id", type: "int" },
    { name: "first_name", type: "string" },
    { name: "last_name", type: "string" },
    { name: "gender", type: "string" },
    { name: "age", type: "int" },
    { name: "email", type: "string" },
    { name: "ip_address", type: "string" },
  ],
  rows: 1000,
  format: "JSON",
  lineEnding: "Unix (LF)",
  header: true,
  bom: false,
};

const types = ["int", "string", "float", "boolean"];

export default function Body() {
  const [jsonOutput, setJsonOutput] = useState(
    "Click Generate JSON to see the output here"
  );
  const [hasGenerated, SetHasGenerated] = useState(false);

  const handleDownload = () => {
    if (!jsonOutput) {
      alert("No JSON to Download");
      return;
    }
    try {
      // Validate JSON before download
      JSON.parse(jsonOutput);
    } catch {
      alert("Invalid JSON format. Please fix the output before downloading.");
      return;
    }
    const blob = new Blob([jsonOutput], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "data.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (values, { setSubmitting }) => {
        const hasEmptyFieldName = values.fields.some(
          (field) => !field.name.trim()
        );

        if (hasEmptyFieldName) {
          alert("Enter all field_name. Field name cannot be empty.");
          setSubmitting(false);
          return;
        }

        if (!values.rows || values.rows <= 0) {
          alert("Please enter a valid number of rows (greater than 0).");
          setSubmitting(false);
          return;
        }
        try {
          const response = await axios.post(
            "https://jsongenerator.duckdns.org/",
            values
          );
          const orderedRecords = response.data.records.map((record) => {
            let ordered = {};
            values.fields.forEach((field) => {
              ordered[field.name] = record[field.name];
            });
            return ordered;
          });

          setJsonOutput(
            JSON.stringify(
              {
                message: response.data.message,
                records: orderedRecords,
              },
              null,
              2
            )
          );
          SetHasGenerated(true);
        } catch (error) {
          console.error("Request failed:", error);
          alert("Something went wrong. Check console.");
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ values }) => (
        <main className="bg-[#fff] w-full min-h-screen flex flex-col items-start p-4 sm:p-6 lg:flex-row mt-16 ">
          <div>
            <Form className="w-full max-w-full ">
              {/* Table header */}
              <div className="grid grid-cols-3 max-w-3xl text-gray-400 gap-4 text-md font-semibold mb-2">
                <div>Field Name</div>
                <div>Type</div>
              </div>

              {/* Dynamic rows */}
              <FieldArray name="fields">
                {({ remove, push }) => (
                  <>
                    {values.fields.map((f, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-3 max-w-3xl gap-4 items-center p-2 rounded mb-1"
                      >
                        {/* Field name */}
                        <Field
                          name={`fields.${index}.name`}
                          placeholder="field_name"
                          className="p-2 rounded max-w-3xl w-full border border-[#aee0e4]  focus:outline-none"
                        />

                        {/* Type dropdown */}
                        <Field
                          as="select"
                          name={`fields.${index}.type`}
                          className="p-2 w-full max-w-3xl border border-[#aee0e4]  rounded  focus:outline-none"
                        >
                          {types.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </Field>

                        <div>
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className=" px-2 py-1 rounded"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => push({ name: "", type: "int", blank: 0 })}
                      className="text-white bg-[#2046cf] cursor-pointer hover:bg-blue-900 px-4 py-2 mt-2 rounded"
                    >
                      + Add Another Field
                    </button>
                  </>
                )}
              </FieldArray>

              <div className="mt-4 border-t border-gray-700 my-6 pt-4 flex space-x-4 items-center flex-wrap gap-4">
                <label>
                  # Rows:
                  <Field
                    type="number"
                    name="rows"
                    className="border border-[#aee0e4] ml-2 p-1 w-20 rounded  focus:outline-none"
                  />
                </label>
                <label>
                  Format:
                  <Field
                    as="select"
                    name="format"
                    className="border border-[#aee0e4] ml-2 p-1 rounded  focus:outline-none"
                  >
                    <option>JSON</option>
                  </Field>
                </label>
              </div>

              <button
                type="submit"
                className="bg-[#2046cf] cursor-pointer hover:bg-blue-900 text-white px-4 py-2 mt-4 rounded mb-4"
              >
                Generate JSON
              </button>
            </Form>
          </div>

          <div className="w-full lg:w-[40%] flex flex-col border border-blue-200 p-5 rounded-md lg:ml-10 lg:mr-4 mt-6 lg:mt-0">
            {/* Container for heading + buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <h2 className="text-xl font-bold">JSON Output</h2>

              {jsonOutput && (
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleDownload}
                    disabled={!hasGenerated}
                    className={`px-4 py-2 rounded text-white ${
                      hasGenerated
                        ? "bg-[#2046cf] hover:bg-blue-900 cursor-pointer"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Download JSON
                  </button>
                  <button
                    onClick={() => {
                      if (!hasGenerated) return;
                      const jsonUrl = "https://jsongenerator.duckdns.org/";
                      const editorUrl = `https://json-format.com/?url=${encodeURIComponent(
                        jsonUrl
                      )}`;
                      window.open(editorUrl, "_blank");
                    }}
                    disabled={!hasGenerated}
                    className={`px-4 py-2 rounded text-white ${
                      hasGenerated
                        ? "bg-[#2046cf] hover:bg-blue-900 cursor-pointer"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Editor
                  </button>
                </div>
              )}
            </div>

            <div
              style={{ padding: "1rem" }}
              className="overflow-y-auto scrollbar-hide mt-4"
            >
              <CodeMirrorEditor
                initialDoc={jsonOutput}
                onChange={(val) => setJsonOutput(val)}
                readOnly={!hasGenerated}
              />
            </div>
          </div>
        </main>
      )}
    </Formik>
  );
}
