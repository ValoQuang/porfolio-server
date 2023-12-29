import jwt from 'jsonwebtoken';

export const signIn = async (req, res) => {
    try {

    } catch(error) {
        console.error('Error registering user:', error);
 res.status(500).json({ error: 'An error occurred while registering the user' });
    }
}