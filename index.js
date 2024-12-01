const fs = require('fs');
const path = require('path');
const os = require('os');
const axios = require('axios');
const cheerio = require('cheerio');
const cliProgress = require('cli-progress');

/**
 * Download a video from a URL into a filename.
 * @param {string} url - The video URL to download
 * @param {string} fileName - The file name or path to save the video to.
 */
async function downloadVideo(url, fileName) {
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });

    const totalSize = parseInt(response.headers['content-length'], 10);
    const downloadPath = path.join(os.homedir(), 'Downloads', fileName);

    // Create progress bar
    const progressBar = new cliProgress.SingleBar({
        format: `Downloading ${fileName} [{bar}] {percentage}% | {value}/{total} bytes`,
    }, cliProgress.Presets.shades_classic);
    
    progressBar.start(totalSize, 0);

    // Create write stream
    const writer = fs.createWriteStream(downloadPath);

    // Pipe the response data to the file while updating the progress bar
    response.data.on('data', (chunk) => {
        progressBar.increment(chunk.length);
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', () => {
            progressBar.stop();
            console.log(`Successfully downloaded: ${fileName}`);
            resolve();
        });
        writer.on('error', reject);
    });
}

/**
 * Extract all video URLs and their details from the tweet
 * @param {string} url - The twitter post URL to download from
 */
async function downloadTwitterVideos(url) {
    try {
        const apiUrl = `https://twitsave.com/info?url=${url}`;
        const response = await axios.get(apiUrl);
        const $ = cheerio.load(response.data);
        
        // Find all video containers
        const videoContainers = $('.origin-top-right');
        
        if (videoContainers.length === 0) {
            console.log('No videos found in the tweet.');
            return;
        }

        console.log(`Found ${videoContainers.length} video(s) in the tweet.`);

        // Get base filename from the tweet text
        let baseFileName = $('.leading-tight').first().find('p.m-2').first().text();
        baseFileName = baseFileName.replace(/[^a-zA-Z0-9]+/g, ' ').trim();

        // Process each video
        for (let i = 0; i < videoContainers.length; i++) {
            const container = $(videoContainers[i]);
            const qualityButtons = container.find('a');
            
            // Get highest quality video URL (first button)
            const highestQualityUrl = qualityButtons.first().attr('href');
            
            if (!highestQualityUrl) {
                console.log(`Could not find download URL for video ${i + 1}`);
                continue;
            }

            // Create unique filename for each video
            const fileName = videoContainers.length === 1 
                ? `${baseFileName}.mp4`
                : `${baseFileName}_video${i + 1}.mp4`;

            console.log(`\nDownloading video ${i + 1} of ${videoContainers.length}`);
            await downloadVideo(highestQualityUrl, fileName);
        }

        console.log('\nAll videos downloaded successfully!');
    } catch (error) {
        console.error('Error downloading videos:', error.message);
    }
}

// Main execution
if (process.argv.length < 3) {
    console.log('Please provide the Twitter video URL as a command line argument.\nEg: node twitter_downloader.js <URL>');
} else {
    const url = process.argv[2];
    if (url) {
        downloadTwitterVideos(url);
    } else {
        console.log('Invalid Twitter video URL provided.');
    }
}