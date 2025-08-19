import fs from "fs/promises";
import path from "path";

const UPLOADS_DIR = path.join(process.cwd(), "public/uploads/profile-pictures");
// Make sure this matches your actual uploads folder

export async function cleanupUserProfilePictures(userId: number, currentFilename: string) {
    try {
        const files = await fs.readdir(UPLOADS_DIR);

        //Searches through the prefix of the user ID
        const userPrefix = `profile_${userId}_`;

        const userFiles = files.filter(file => file.startsWith(userPrefix));

        //Delete the current profile picture to replace it with the new one
        await Promise.all(
            userFiles.map(async (file) => {
                if (file !== currentFilename) {
                    await fs.unlink(path.join(UPLOADS_DIR, file));
                }
            })
        );

        console.log(`Cleaned up old profile pictures for user`);
    } catch (error) {
        console.error(`Error cleaning up profile pictures for user`, error);
    }
}
