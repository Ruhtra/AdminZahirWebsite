/* eslint-disable @typescript-eslint/no-explicit-any */
// import puppeteer from 'puppeteer-core'


const isVercel = !!process.env.VERCEL_ENV;

class Instagram {
    _name = "";
    constructor(name: string) {
        // if (!name) throw new Error("Name is required");
        this._name = name;
    }



    converterInstagramFollowers(followers: string): number {
        const sanitizedFollowers = followers.toLowerCase().trim();
        const regex = /([\d,.]+)\s?(mil|mi)?/;
        const match = sanitizedFollowers.match(regex);

        if (match) {
            const getNumber = match[1].replace(",", ".")
            const unit = match[2];

            let number = parseFloat(getNumber);

            if (unit === "mil") {
                number *= 1000;
            }
            if (unit === "mi") {
                number *= 1000000;
            }

            return Math.round(number);
        }

        return 0;
    }
    // converterInstagramFollowers(followers: string): number {
    //     // if (typeof followers !== 'string') {
    //     //     return 0;
    //     // }
    //     console.log('aaaaaaaa');
    //     console.log(followers);


    //     if (!followers) return 0;


    //     followers = followers.trim().toLowerCase();

    //     if (followers.includes('mi')) {
    //         const number = parseFloat(followers.replace('mi', '').trim());
    //         return number * 1000000;
    //     }

    //     if (followers.includes('mil')) {
    //         const number = parseFloat(followers.replace('mil', '').trim());
    //         return number * 1000;
    //     }

    //     return parseInt(followers.replace(/[^0-9]/g, ''));
    // }

    async getInstagramFollowers() {
        // let browser = null;

        const { puppeteer, launchOptions } = await getOpt()


        const browser = await puppeteer.launch(launchOptions);
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.goto(`https://www.instagram.com/${this._name}/`);
        await page.waitForSelector('.x1lliihq.x1plvlek.xryxfnj.x1n2onr6.xyejjpt.x15dsfln.x193iq5w.xeuugli.x1fj9vlw.x13faqbe.x1vvkbs.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.x1i0vuye.xl565be.xo1l8bm.x1roi4f4.x2b8uid.x10wh9bi.xpm28yp.x8viiok.x1o7cslx');

        const followers = await page.evaluate(() => {
            const elements = document.querySelectorAll('.x1lliihq.x1plvlek.xryxfnj.x1n2onr6.xyejjpt.x15dsfln.x193iq5w.xeuugli.x1fj9vlw.x13faqbe.x1vvkbs.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.x1i0vuye.xl565be.xo1l8bm.x1roi4f4.x2b8uid.x10wh9bi.xpm28yp.x8viiok.x1o7cslx');

            const result: any[] = [];
            elements.forEach((element) => {
                const textContent = element?.textContent;
                const text = textContent ? textContent.trim() : "";

                if (text.includes("seguidores") || text.includes("followers")) {
                    result.push(text.split(/\s+/).slice(0, 2).join(' '));

                }
            });
            return result;
        });


        // const followers = await page.$eval('meta[name="description"]', (element: any) => {
        //     const content = element.getAttribute('content');

        //     return content?.split(' ')[0];
        // });
        if (!followers) {
            await browser.close();
            throw new Error("Não foi possível encontrar a quantidade de seguidores");
        }
        const followersCount = this.converterInstagramFollowers(followers[0]);
        await browser.close();
        return followersCount;
    }
}

class Tiktok {
    _name = "";
    constructor(name: string) {
        // if (!name) throw new Error("Name is required");
        this._name = '@' + name;
    }

    converterTikTokFollowers(followers: string): number {
        // if (typeof followers !== 'string') {
        //     return 0;
        // }

        followers = followers.trim().toLowerCase();

        if (followers.includes('m')) {
            const number = parseFloat(followers.replace('m', '').trim());
            return number * 1000000;
        }

        if (followers.includes('k')) {
            const number = parseFloat(followers.replace('k', '').trim());
            return number * 1000;
        }

        return parseInt(followers.replace(/[^0-9]/g, ''));
    }

    async getTikTokFollowers() {
        const { puppeteer, launchOptions } = await getOpt()



        const browser = await puppeteer.launch(launchOptions);
        const page = await browser.newPage();
        await page.goto(`https://www.tiktok.com/${this._name}`);
        await page.waitForSelector('strong[data-e2e="followers-count"]');
        const followers = await page.$eval('strong[data-e2e="followers-count"]', (element: any) => element.innerText);
        await browser.close();
        return this.converterTikTokFollowers(followers);
    }
}

class YouTube {
    _name = "";
    constructor(name: string) {
        // if (!name) throw new Error("Name is required");
        this._name = '@' + name;
    }

    converterYoutubeFollowers(followers: string): number {
        const sanitizedFollowers = followers.toLowerCase().trim();
        const regex = /([\d,.]+)\s?(mil|mi)?/;
        const match = sanitizedFollowers.match(regex);

        if (match) {
            const getNumber = match[1].replace(",", ".")
            const unit = match[2];

            let number = parseFloat(getNumber);

            if (unit === "mil") {
                number *= 1000;
            }
            if (unit === "mi") {
                number *= 1000000;
            }

            return Math.round(number);
        }

        return 0;
    }

    async getYouTubeFollowers() {
        const { puppeteer, launchOptions } = await getOpt()


        const browser = await puppeteer.launch(launchOptions);
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.goto(`https://www.youtube.com/${this._name}`, { waitUntil: 'networkidle2' });

        // try {
        await page.waitForSelector('.yt-core-attributed-string.yt-content-metadata-view-model__metadata-text.yt-core-attributed-string--white-space-pre-wrap.yt-core-attributed-string--link-inherit-color:nth-child(1)', { timeout: 10000 });
        const inscritos = await page.evaluate(() => {
            const elements = document.querySelectorAll('.yt-core-attributed-string.yt-content-metadata-view-model__metadata-text.yt-core-attributed-string--white-space-pre-wrap.yt-core-attributed-string--link-inherit-color:nth-child(1)');

            const result: any[] = [];
            console.log('elementos:');

            elements.forEach((element) => {
                const textContent = element?.textContent;
                const text = textContent ? textContent.trim() : "";
                console.log(text);

                if (text.includes("inscritos") || text.includes("subscribers") || text.includes("subscritores")) {
                    result.push(text);
                }
            });
            return result;
        });

        const followersCount = this.converterYoutubeFollowers(inscritos[0]);
        return followersCount;
        // } catch (error) {
        //     console.error("Erro ao buscar seguidores:", error);
        //     return null;
        // } finally {
        //     await browser.close();
        // }
    }
}

// Classe para gerenciar a busca nos perfis sociais
export class SocialMediaFollowers {
    options: SocialMediaFollowersOptions;

    constructor(options: SocialMediaFollowersOptions) {
        this.options = options || [];
    }

    async getFollowers() {
        const { instagram, tiktok, youtube, sumTotal } = this.options;
        const followersData = { instagram: 0, tiktok: 0, youtube: 0, total: 0 };

        // Condicional para adicionar os resultados individuais ou somados
        if (instagram) {
            followersData.instagram = await new Instagram(instagram).getInstagramFollowers();
        }
        if (tiktok) {
            followersData.tiktok = await new Tiktok(tiktok).getTikTokFollowers();
        }
        if (youtube) {
            followersData.youtube = await new YouTube(youtube).getYouTubeFollowers();
        }

        if (sumTotal) {
            const total = Object.values(followersData).reduce((acc, curr) => acc + curr, 0);
            followersData.total = total;
        }

        return followersData;
    }
}

type SocialMediaFollowersOptions = {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    sumTotal?: boolean;
};
async function getOpt(): Promise<{ puppeteer: any; launchOptions: any; }> {
    if (isVercel) {
        const chromium = (await import("@sparticuz/chromium")).default;
        return {

            puppeteer: await import("puppeteer-core"),
            launchOptions: {
                headless: true,
                args: chromium.args,
                executablePath: await chromium.executablePath(),
            }
        }
    } else {
        return {
            puppeteer: await import("puppeteer"),
            launchOptions: {
                headless: true,
            }
        }
    }
}

