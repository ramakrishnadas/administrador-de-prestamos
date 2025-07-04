import React from "react";

type EntityModalProps<T> = {
  visible: boolean;
  onClose: () => void;
  onSave: (data: T) => void;
  initialData?: T;
  FormComponent: React.ComponentType<{
    onSave: (data: T) => void;
    onCancel: () => void;
    id?: string;
  }>;
};

export function EntityModal<T>({
  visible,
  onClose,
  onSave,
  initialData,
  FormComponent,
}: EntityModalProps<T>) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-opacity-40 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-2xl shadow-lg max-w-2xl w-full relative max-h-[90vh] overflow-y-auto">
        <FormComponent
          onSave={(data) => {
            onSave(data);
            onClose();
          }}
          onCancel={onClose}
          id={undefined}
        />
      </div>
    </div>
  );
}
