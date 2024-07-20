const Express = require("express");
const MyRouter = Express.Router();

const appointment = require("../../Models/Appointment/Appointment");
const appointmentSchema = require("../../Schema/Appointment/Appointment");
const { SendMail } = require("./secureLink");
const sendSms = require("./SMSto");

//get All
MyRouter.get("/", async (req, res) => {
    const C = await appointment.find();
    try {
        res.send(C);
    } catch (err) {
        res.send("Error: " + err);
    }
});

MyRouter.get("/adminGet", async (req, res) => {
    try {
        let appointments = await appointment.find();

        // Sorting appointments by sessionDate
        appointments = appointments.sort((a, b) => {
            const dateA = new Date(a.sessionDate);
            const dateB = new Date(b.sessionDate);
            return dateA - dateB;
        });



        // Getting the current date in the same format as sessionDate
        const currentDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });

        // Filtering appointments whose sessionDate matches the current date
        const todayAppointments = appointments.filter(appointment => {
            const sessionDate = new Date(appointment.sessionDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
            return sessionDate === currentDate;
        });


        // You can now use the todayAppointments variable as needed
        // console.log('Today\'s Appointments:', todayAppointments);

        let numberOfNewAppointment = 0;
        appointments.map((elem, index) => {
            if (elem.status === "New")
                numberOfNewAppointment = numberOfNewAppointment + 1
        })

        res.send({
            totalAppointments: appointments.length,
            AllAppointment: appointments,
            todayAppointments,
            totalTodayAppointments: todayAppointments.length,
            newAppointment: numberOfNewAppointment,
        });
    } catch (err) {
        res.status(500).send("Error: " + err);
    }
});



MyRouter.post("/Add", async (req, res) => {
    const NewAppointment = req.body;

    // console.log(NewAppointment);

    const { error } = appointmentSchema(NewAppointment);
    if (error) {
        res.status(404).send({ message: error.details[0].message });
    } else {
        try {
            const UpdateAppointment = await appointment.findOne({ sessionTime: NewAppointment.sessionTime, sessionDate: NewAppointment.sessionDate });
            if (UpdateAppointment) {
                return res.status(404).send({ message: "Already booked" });
            }

            let AddAppointment = new appointment(NewAppointment);
            AddAppointment = await AddAppointment.save();

            // SendMail
            const mailResult = await SendMail(req, res);
            // console.log("Return mujha Mila [" + mailResult + "]");

            if (mailResult) {
                // Call the additional function
                const additionalResult = await sendSms(req, res);
                // console.log("Additional function result: ", additionalResult);

                // If additionalFunction is successful
                if (additionalResult) {
                    res.send(AddAppointment);
                } else {
                    res.status(500).send({ message: "Additional function failed" });
                }
            } else {
                res.status(500).send({ message: "SendMail failed" });
            }
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Internal server error" });
        }
    }
});


MyRouter.post("/AddNoSMS", async (req, res) => {
    const NewAppointment = req.body;

    // console.log(NewAppointment);

    const { error } = appointmentSchema(NewAppointment);
    if (error) {
        res.status(404).send({ message: error.details[0].message });
    } else {
        try {
            const UpdateAppointment = await appointment.findOne({ sessionTime: NewAppointment.sessionTime, sessionDate: NewAppointment.sessionDate });
            if (UpdateAppointment) {
                return res.status(404).send({ message: "Already booked" });
            }

            let AddAppointment = new appointment(NewAppointment);
            AddAppointment = await AddAppointment.save();

            res.send(AddAppointment);

        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Internal server error" });
        }
    }
});


// Update Data 
MyRouter.patch("/Update/:id", async (req, res) => {
    const UpdateAppointment = await appointment.findOne({ _id: req.params.id });
    // console.log(UpdateAppointment);
    UpdateAppointment.appointment = req.body.appointment

    try {
        const C = await UpdateAppointment.save();
        res.send(C);
    } catch (err) {
        res.send("Error: " + err);
    }
});

// Delete Data
MyRouter.delete("/Delete/:id", async (req, res) => {
    const deleteAppointment = appointment.findOne({ _id: req.params.id });
    try {
        const C = await deleteAppointment.remove();
        res.send(C);
    } catch (Error) {
        res.send("Error: " + Error);
    }
});

// Just SMS send
MyRouter.post("/SMSsend", async (req, res) => {
    // console.log("ma Chala")
    try {
        const C = await sendSms();
        res.send(C);
    } catch (Error) {
        res.send("Error: " + Error);
    }
});

module.exports = MyRouter;
