import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

const registeredUser = asyncHandler( async (req, res) => {
    
    /*Get user details from frontend
    verify the details -> validation not empty
    Check user if alredy exsist : username & email
    check for images, check for avatar
    upload to cloudinary, avatar
    create user object -> create entry in DB
    remove password and refreshToken fields from response
    check for user creation 
    return res
    */

    const {username, email, fullName, password} = req.body
    //console.log("email: ", email);

    if(
        [fullName, email, username, password].some((field) => 
        field?.trim() === "")
    )
        {
        return new ApiError(400, "All fields are required")
    }

    const  exsistedUser = await User.findOne({
        $or: [{ email }, { password }]
    })
    if(exsistedUser){
        throw new ApiError(409, "User already exsist")
    }

    const avatarLocaPath = req.files?.avatar[0]?.path

    //const coverImageLocalPath = req.files?.coverImage[0]?.path

    let coverImageLocalPath;
    if(req.files && 
        Array.isArray(req.files.coverImage) && 
        req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocaPath) {
        throw new ApiError(400, "Avatar image required")
    }

    const avatar = await uploadOnCloudinary(avatarLocaPath)
    const coverImage =  await uploadOnCloudinary(coverImageLocalPath)
    

    if(!avatar){
        throw new ApiError(400, "Avatar image required")
    }

    const user = await User.create({
        fullName,
        username: username.toLowerCase(),
        password,
        email,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })

    const createdUser = await User.findOne(user._id).select("-password -refreshToken")

    if(!createdUser) {
        throw new ApiError(500, "Something went wrong while resgistering user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered sucessfully")
    )


} )

export {
    registeredUser
}