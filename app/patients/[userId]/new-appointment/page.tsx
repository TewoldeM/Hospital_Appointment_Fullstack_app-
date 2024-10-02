import Image from "next/image";

import React from 'react';
import { getPatient } from "@/lib/actions/patient.actions";
import { AppointmentForm } from "@/components/forms/AppointmentForm";
import * as Sentry from "@sentry/nextjs"

//! The Appointment component is an async function that takes in the SearchParamProps as its parameter.
// ?It extracts the userId from the params object and uses it to call the getPatient function, which retrieves the patient details from a database.
//! The component then renders the AppointmentForm component, passing the patientId and userId as props.
// ?The getPatient function is an async function that retrieves the patient details from a database.

const Appointment = async ({ params: { userId } }: SearchParamProps) => {
  const patient = await getPatient(userId);
  Sentry.metrics.set("user_view_appointment", "patient.name");
  return (
    <div className="flex h-screen max-h-screen">
      <section className="remove-scrollbar container my-auto">
        <div className="sub-container max-w-[860px] flex-1 justify-between">
          <Image
            src="/assets/icons/logo-full.svg"
            height={1000}
            width={1000}
            alt="logo"
            className="mb-12 h-10 w-fit"
          />
          <AppointmentForm
            type="create"
            patientId={patient?.$id}
            userId={userId}
          />

          <p className="copyright mt-10 py-12">© 2024 CarePluse</p>
        </div>
      </section>

      <Image
        src="/assets/images/appointment-img.png"
        height={1500}
        width={1500}
        alt="appointment"
        className="side-img max-w-[390px] bg-bottom"
      />
    </div>
  );
};

export default Appointment;