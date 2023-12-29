import jwt from 'jsonwebtoken'

export class AppError extends Error {
    status: number;
    constructor(message: string ,statusCode: number)
    {
        super(message)
        this.status = statusCode
    }

}
const userAuth = async(req,res,next)=>{
    try 
    {
        const token = req.header('token');
        const decoded = jwt.verify(token,process.env.JWT_LOGIN_KEY)
        if(!decoded.userId || !decoded.userEmail)
        {
            next(new AppError("Invalid token or it may be expired",400))
        }
        else
        {
            const user = await userModel.findById(decoded.userId)
            if(user && user.isActive)
            {
                req.userId = decoded.userId;
                next();
            }

            else
            {
                next(new AppError("Please Login first",400))
            }
        } 
    } 
    
    
    catch (error) 
    {
        next(new AppError(error,400))
    }
}

export default userAuth;