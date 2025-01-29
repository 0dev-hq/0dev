import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import type { Integration } from "./integration";
import { CustomCredentialValue } from "@/services/agentControllerService";
import { Input } from "@/components/ui/input";

export default function CustomIntegration({
  integrationName,
  integ,
  values,
  updateCredentials,
}: {
  integrationName: string;
  values: CustomCredentialValue[];
  integ: Integration;
  updateCredentials: (
    integrationName: string,
    credentials: CustomCredentialValue[]
  ) => void;
}) {
  // Explicitly type defaultValues to ensure compatibility
  const defaultValues: Record<string, string> =
    integ.authInputs?.reduce(
      (acc, input) => ({
        ...acc,
        [input.name]:
          values.find((cred) => cred.name === input.name)?.value || "",
      }),
      {}
    ) || {};

  const {
    control,
    handleSubmit,
    formState: { isDirty, isSubmitting },
  } = useForm({
    defaultValues,
  });

  const onSubmit = (formData: Record<string, string>) => {
    const updatedCredentials = integ.authInputs?.map((input) => ({
      name: input.name,
      type: input.type,
      value: formData[input.name] || "",
    })) as CustomCredentialValue[];

    updateCredentials(integrationName, updatedCredentials);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {integ.authInputs?.map((input) => (
        <div key={input.name} className="space-y-2">
          <label
            htmlFor={input.name}
            className="text-sm font-medium text-gray-700"
          >
            {input.label}
          </label>
          <Controller
            name={input.name} // This is now correctly typed
            control={control}
            render={({ field }) => (
              <Input
                id={input.name}
                type={input.type}
                {...field}
                className="w-full"
              />
            )}
          />
        </div>
      ))}
      <Button
        type="submit"
        className="w-full bg-black text-white hover:bg-gray-800"
        disabled={!isDirty || isSubmitting} // Disable when form is pristine or submitting
      >
        Save {integrationName}
      </Button>
    </form>
  );
}
