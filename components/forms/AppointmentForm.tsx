"use client";
import  FileUploader from "@/components/FileUploader"
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Form, FormControl } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SelectItem } from "@/components/ui/select";

import { createUser, registerPatient } from "@/lib/actions/patient.actions";
import { getAppointmentSchema, PatientFormValidation, UserFormValidation } from "@/lib/validation";

import "react-datepicker/dist/react-datepicker.css";
import "react-phone-number-input/style.css";
import CustomFormField from "../CustomFormField";
import { FormFieldType } from "./PatientForm";
// import { FileUploader } from "../FileUploader";
import SubmitButton from "../SubmitButton";
import { createAppointment, updateAppointment } from "@/lib/actions/appointment.actions";
import { Appointment } from "@/types/appwrite.types";
const Doctors = [
  {
    image: "/assets/images/dr-green.png",
    name: "John Green",
  },
  {
    image: "/assets/images/dr-cameron.png",
    name: "Leila Cameron",
  },
  {
    image: "/assets/images/dr-livingston.png",
    name: "David Livingston",
  },
  {
    image: "/assets/images/dr-peter.png",
    name: "Evan Peter",
  },
  {
    image: "/assets/images/dr-powell.png",
    name: "Jane Powell",
  },
  {
    image: "/assets/images/dr-remirez.png",
    name: "Alex Ramirez",
  },
  {
    image: "/assets/images/dr-lee.png",
    name: "Jasmine Lee",
  },
  {
    image: "/assets/images/dr-cruz.png",
    name: "Alyana Cruz",
  },
  {
    image: "/assets/images/dr-sharma.png",
    name: "Hardik Sharma",
  },
];
export const AppointmentForm = ({
  userId,
  patientId,
  type = "create",
  appointment,
  setOpen,
}: {
  userId: string;
  patientId: string;
  type: "create" | "schedule" | "cancel";
  appointment?: Appointment;
  setOpen?:(open:boolean)=>void
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const AppointmentFormValidation = getAppointmentSchema(type);
console.log(appointment)
  const form = useForm<z.infer<typeof AppointmentFormValidation>>({
    resolver: zodResolver(AppointmentFormValidation),
    defaultValues: {
      primaryPhysician: appointment ? appointment?.primaryPhysician : "",
      schedule: appointment
        ? new Date(appointment?.schedule!)
        : new Date(Date.now()),
      reason: appointment ? appointment.reason : "",
      note: appointment?.note || "",
      cancellationReason: appointment?.cancellationReason || "",
    },
  });
  async function onSubmit  (values: z.infer<typeof AppointmentFormValidation>){
    setIsLoading(true);
    let status;
    switch (type) {
      case "schedule":
        status = "scheduled";
        break;
      case "cancel":
        status = "cancelled";
        break;
      default:
        status = "pending";
    }
  try{
    if (type === "create" && patientId) {
      const appointment = {
        userId,
        patient: patientId,
        primaryPhysician: values.primaryPhysician,
        schedule: new Date(values.schedule),
        reason: values.reason!,
        status: status as Status,
        note: values.note,
      };

      const newAppointment = await createAppointment(appointment);

      if (newAppointment) {
        form.reset();
        router.push(
          `/patients/${userId}/new-appointment/success?appointmentId=${newAppointment.$id}`
        );
      }
    }
    else {
      
      const appointmentToUpdate = {
        userId,
        appointmentId: appointment?.$id!,
        appointment: {
          primaryPhysician: values.primaryPhysician,
          schedule: new Date(values.schedule),
          status: status as Status,
          cancellationReason: values.cancellationReason,
        },
        type,
      };

      const updatedAppointment = await updateAppointment(appointmentToUpdate);

      if (updatedAppointment) {
        setOpen && setOpen(false);
        form.reset();
      }
    
  } 

  } catch (error) {
    console.log(error);
  }
  setIsLoading(false);
};

  let buttonLabel;
    switch (type) {
      case "cancel":
        buttonLabel = "Cancel Appointment";
        break;
      case "schedule":
        buttonLabel = "Schedule Appointment";
        break;
      default:
        buttonLabel = "Submit Apppointment";
    }

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-6">
          {type === "create" && (
            <section className="mb-12 space-y-4">
              <h1 className="header">New Appointment</h1>
              <p className="text-dark-700">
                Request a new appointment in 10 seconds.
              </p>
            </section>
          )}
  
          {type !== "cancel" && (
            <>
                {/* PRIMARY CARE PHYSICIAN */}
                <CustomFormField
            fieldType={FormFieldType.SELECT}
            control={form.control}
            name="primaryPhysician"
            label="Primary care physician"
            placeholder="Select a physician"
          >
            {Doctors.map((doctor, i) => (
              <SelectItem key={doctor.name + i} value={doctor.name}>
                <div className="flex cursor-pointer items-center gap-2">
                  <Image
                    src={doctor.image}
                    width={32}
                    height={32}
                    alt="doctor"
                    className="rounded-full border border-dark-500"
                  />
                  <p>{doctor.name}</p>
                </div>
              </SelectItem>
            ))}
          </CustomFormField>
  
              <CustomFormField
                fieldType={FormFieldType.DATE_PICKER}
                control={form.control}
                name="schedule"
                label="Expected appointment date"
                showTimeSelect
                dateFormat="MM/dd/yyyy  -  h:mm aa"
              />
  
              <div
                className={`flex flex-col gap-6  ${type === "create" && "xl:flex-row"}`}
              >
                <CustomFormField
                  fieldType={FormFieldType.TEXTAREA}
                  control={form.control}
                  name="reason"
                  label="Appointment reason"
                  placeholder="Annual montly check-up"
                  disabled={type === "schedule"}
                />
  
                <CustomFormField
                  fieldType={FormFieldType.TEXTAREA}
                  control={form.control}
                  name="note"
                  label="Comments/notes"
                  placeholder="Prefer afternoon appointments, if possible"
                  disabled={type === "schedule"}
                />
              </div>
            </>
          )}
  
          {type === "cancel" && (
            <CustomFormField
              fieldType={FormFieldType.TEXTAREA}
              control={form.control}
              name="cancellationReason"
              label="Reason for cancellation"
              placeholder="Urgent meeting came up"
            />
          )}
  
          <SubmitButton
            isLoading={isLoading}
            className={`${type === "cancel" ? "shad-danger-btn" : "shad-primary-btn"} w-full`}
          >
            {buttonLabel}
          </SubmitButton>
        </form>
      </Form>
    );
    
  }