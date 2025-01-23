import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken'


// FEATURE:  check whether user is authenticated or not

// check whether user is authenticated or not
// verify based on access token
// if token is valid then add new object user in body

// 1. get token from cookies or header
// 2. if token is present then verify token using jwt.verify
// 3. find use based on decodedToken
// 4. add user object in body 
export const verifyJWT = asyncHandler( async ( req, _, next ) => // if there is no res then we can use _ instead of res
{
    try
    {
        // 1. get token from cookies 
        const token = req.cookies?.accessToken || req.header( "Authorization" )?.replace( "Bearer ", "" )  // get token header. format is [Authorization: Bearer <token>]

        if ( !token ) { throw new ApiError( 401, "Unauthorized request" ) }

        // 2. if token is present then verify token using jwt.verify
        // decodedToken contains user _id, email, username, fullName  
        const decodedToken = jwt.verify( token, process.env.ACCESS_TOKEN_SECRET )   // requied secret key or public key to decode token

        // 3. find use based on decodedToken
        const user = await User.findById( decodedToken._id ).select( "-password -refreshToken" )  // find user based on decodedTokens _id and remove password and refreshToken from response

        if ( !user ) { throw new ApiError( 401, "Invalid Access Token" ) }

        // 4. add user object in body 
        req.user = user
        next()

    } catch ( error )
    {
        throw new ApiError( 401, error?.message || "Invalid Access Token" )

    }

} ) 