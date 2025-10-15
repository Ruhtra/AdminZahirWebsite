import puppeteer from 'puppeteer'

class Instagram {
    _name = "";
    constructor(name: string) {
        // if (!name) throw new Error("Name is required");
        this._name = name;
    }

    converterInstagramFollowers(followers: string): number {
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

    async getInstagramFollowers() {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.goto(`https://www.instagram.com/${this._name}/`);
        await page.waitForSelector('meta[name="description"]');
        const followers = await page.$eval('meta[name="description"]', (element) => {
            const content = element.getAttribute('content');

            return content?.split(' ')[0];
        });
        if (!followers) {
            await browser.close();
            throw new Error("Não foi possível encontrar a quantidade de seguidores");
        }
        const followersCount = this.converterInstagramFollowers(followers);
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
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(`https://www.tiktok.com/${this._name}`);
        await page.waitForSelector('strong[data-e2e="followers-count"]');
        const followers = await page.$eval('strong[data-e2e="followers-count"]', (element) => element.innerText);
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
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.goto(`https://www.youtube.com/${this._name}`, { waitUntil: 'networkidle2' });

        // try {
        await page.waitForSelector('.yt-core-attributed-string.yt-content-metadata-view-model__metadata-text.yt-core-attributed-string--white-space-pre-wrap.yt-core-attributed-string--link-inherit-color:nth-child(1)', { timeout: 10000 });
        const inscritos = await page.evaluate(() => {
            const elements = document.querySelectorAll('.yt-core-attributed-string.yt-content-metadata-view-model__metadata-text.yt-core-attributed-string--white-space-pre-wrap.yt-core-attributed-string--link-inherit-color:nth-child(1)');

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result: any[] = [];
            elements.forEach((element) => {
                const textContent = element?.textContent;
                const text = textContent ? textContent.trim() : "";
                if (text.includes("inscritos")) {
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
