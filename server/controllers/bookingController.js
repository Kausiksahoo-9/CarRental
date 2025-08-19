import Booking from "../models/Booking.js"
import Car from "../models/Car.js";


// Function to check the availability of a car for a given date
export const checkAvailability = async (car, pickupDate, returnDate)=>{
  const bookings = await Booking.find({
    car,
    pickupDate: {$lte: returnDate},
    returnDate: {$gte: pickupDate}
  })
  return bookings.length === 0;
}

//API to check the availability of the car for the given date and location
export const checkAvailabilityOfCar = async (req,res)=>{
  try {
    const {location, pickupDate, returnDate} = req.body

    //fetch all the availbale car for the given location
    const cars = await Car.find({location, isAvaliable: true});

    //check car Availability for the given date range using promises
    const availableCarsPromises = cars.map(async (car)=>{
      const isAvaliable = await checkAvailability(car._id, pickupDate, returnDate);
      return {...car._doc, isAvaliable}
    })

    let availableCars = await Promise.all(availableCarsPromises);
    availableCars = availableCars.filter(car => car.isAvaliable === true)

    res.json({success: true, availableCars});
  } catch (error) {
    console.log(error.message);
    res.status(500).json({success: false, message: error.message});
  }
}

//API for create booking
export const createBooking = async (req,res)=>{
  try {
    const {_id} = req.user;
    const {car,pickupDate,returnDate} = req.body;

    const isAvaliable = await checkAvailability(car,pickupDate,returnDate);
    if(!isAvaliable){
      res.json({success: false, message:"Car is not Available"});
    }

    const carData = await Car.findById(car);

    //Calculate Price based on pickupDate and returnDate
    const picked = new Date(pickupDate);
    const returned = new Date(returnDate);
    const noOfDays = Math.ceil((returned-picked)/(1000*60*60*24));
    const price = carData.pricePerDay * noOfDays;

    await Booking.create({car, owner: carData.owner, user: _id, pickupDate, returnDate, price});

    res.json({success: true, message: "Booking created"})

  } catch (error) {
    console.log(error.message);
    res.json({success: false, message: error.message});
  }
}

//API to list User bookings
export const getUserBookings = async (req,res)=>{
  try {
    const {_id} = req.user;
    const bookings = await Booking.find({ user: _id }).populate('car').sort({ createdAt: -1 })

    res.json({success: true, bookings});

  } catch (error) {
    console.log(error.message);
    res.json({success: false, message: error.message});
  }
}

//API to get Owner bookings
export const getOwnerBookings = async (req,res)=>{
  try {
    if(req.user.role !== "owner"){
      res.json({success: false, message:"Unauthorized"});
    }
    const bookings = await Booking.find({ owner: req.user._id}).populate('car user').sort({ createdAt: -1 })

    res.json({success: true, bookings});
    
  } catch (error) {
    console.log(error.message);
    res.json({success: false, message: error.message});
  }
}

//API to change the Booking status
export const changeBookingStatus = async (req,res)=>{
  try {
    const {_id} = req.user;
    const {bookingId, status} = req.body;
    const booking = await Booking.findById(bookingId)

    if(booking.owner.toString() !== _id.toString()){
      res.json({success: false, message:"Unauthorized"});
    }

    booking.status = status;
    await booking.save();

    res.json({ success: true, message: "Status Updated"})

  } catch (error) {
    console.log(error.message);
    res.json({success: false, message: error.message});
  }
}
