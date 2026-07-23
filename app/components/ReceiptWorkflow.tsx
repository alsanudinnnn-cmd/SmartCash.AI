"use client";

import { Fragment, useState } from "react";
import { Check } from "lucide-react";
import { ReceiptUploader } from "@/app/components/ReceiptUploader";

const STEPS = ["Muat naik", "Analisis AI", "Sahkan"];

export function ReceiptWorkflow() {
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <>
      <div className="upload-steps" aria-label="Proses imbasan">
        {STEPS.map((label, index) => {
          const step = index + 1;
          const complete = step < currentStep;
          const active = step === currentStep;
          return (
            <Fragment key={label}>
              <span
                className={complete ? "complete" : active ? "active" : ""}
                aria-current={active ? "step" : undefined}
              >
                <b aria-hidden="true">
                  {complete ? <Check size={13} strokeWidth={2.5} /> : step}
                </b>
                {label}
              </span>
              {step < STEPS.length && <i className={complete ? "complete" : ""} aria-hidden="true" />}
            </Fragment>
          );
        })}
      </div>
      <ReceiptUploader onStepChange={setCurrentStep} />
    </>
  );
}
