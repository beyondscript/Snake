require('dotenv').config()

const fs = require('fs')
const path = require('path')

const distPath = path.join(__dirname, 'dist')
const htaccessPath = path.join(distPath, '.htaccess')
const indexPath = path.join(distPath, 'index.html')

const htaccessContent = `
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /

    RewriteCond %{HTTP_HOST} !^www\. [NC]
    RewriteRule ^(.*)$ https://www.%{HTTP_HOST}/$1 [L,R=301]

    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>
`

const metaTags = `
<meta property="og:image" content="${process.env.VITE_APP_URL}/images/icons/fbicon.png">
`

const detectPackageManager = () => {
    if (fs.existsSync(path.join(__dirname, 'package-lock.json'))) {
        return 'npm'
    }
    else if (fs.existsSync(path.join(__dirname, 'yarn.lock'))) {
        return 'yarn'
    }
    else {
        return 'unknown'
    }
}

const generateHtaccess = () => {
    fs.writeFile(htaccessPath, htaccessContent.trim(), (err) => {
        if (err) {
            console.error('Failed to generate the .htaccess file: ', err)
        }
        else {
            console.log('The .htaccess file has been generated successfully.')
        }
    })
}

const insertMetaTags = async () => {
    try {
        const indexHtml = await fs.promises.readFile(indexPath, 'utf-8')

        const metaDescription = /(<meta\s+name=["']description["'][^>]*>)/i

        const modifiedIndexHtml = indexHtml.replace(metaDescription, `$1\n${metaTags}`)

        await fs.promises.writeFile(indexPath, modifiedIndexHtml)

        console.log('Meta tags are successfully inserted in the index.html file.')
    }
    catch (err) {
        console.error('Failed to insert meta tags in the index.html file: ', err)
    }
}

if (!fs.existsSync(distPath)) {
    const packageManager = detectPackageManager()

    if (packageManager === 'unknown') {
        console.log("Please make sure you are using the correct package manager.")
    }
    else if(packageManager === 'npm') {
        console.log("Please run the 'npm run build' first.")
    }
    else if(packageManager === 'yarn') {
        console.log("Please run the 'yarn build' first.")
    }
}
else {
    generateHtaccess()
    insertMetaTags()
}
