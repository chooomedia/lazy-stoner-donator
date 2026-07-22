class AdCard extends Card {

    constructor(cardOptions) {
        super(cardOptions);

        this.adHost = cardOptions.host; // amazon
        this.partnerId = cardOptions.partner; // chooomedia-21
        this.adId = cardOptions.adId; // f.E. B079QHMFWC   

        if (typeof this.adHost === "string") { 
            let cardIconType = this.setCardTypeIcon(this.adHost);
            this.domElement.appendChild(cardIconType);
        }

        if (typeof this.adHost === "string") {
            if (this.adHost.includes("amazon")) {
                this.front = this.createAmznImgEl(this.adId);
                this.domElement.appendChild(this.front);
                this.back = this.createAmznIframe(this.adId);
                this.domElement.appendChild(this.back);

            } else if (this.adHost.includes("google")) {
                this.front = this.createGoglObjEl(this.adId);
                this.domElement.appendChild(this.front);
                this.back = "";
            }
        }
    }

    setCardTypeIcon(adHost) {
        let cardIconType = document.createElement("i");
        cardIconType.style.position = "absolute";
        cardIconType.style.color = "#888";
        cardIconType.style.bottom = "4px";
        cardIconType.style.right = "4px";
        cardIconType.style.width = "32px";
        cardIconType.style.height = "32px";
        cardIconType.style.transition = "transform .4s;";
        cardIconType.style.lineHeight = "32px";
        cardIconType.style.display = "inline-grid";
        cardIconType.style.textAlign = "center";
        cardIconType.style.textShadow = "0px 0px 8px rgba(76, 76, 76, 0.7)";

        cardIconType.className = "fab fa-" + adHost;
        return cardIconType;
    }

    // Creates an affiliate linked element
    createAmznImgEl(adId) {
        let product = document.createElement("img");
        iframe.width = "101%";
        iframe.height = "138px";
        iframe.style.marginTop = "13px";
        product.style.transform = "rotateY(180deg) scaleY(1.2)";
        product.style.border = "0";
        product.src = "//ws-eu.amazon-adsystem.com/widgets/q?_encoding=UTF8&MarketPlace=DE&ASIN=" + adId + 
                      "&ServiceVersion=20070822&ID=AsinImage&WS=1&Format=_SL250_&tag=" + this.partnerId;

        product.link = "https://www.amazon.de/gp/product/" + adId +
                       "/ref=as_li_tl?ie=UTF8&camp=1638&creative=6742&creativeASIN=" + adId + 
                       "&linkCode=as2&tag=" + this.partnerId + "&linkId=bb90198dddc380b6b2cd1a2e6765d4bd";
        product.onclick = () => {
            window.open(product.link, '_blank');
        };
        return product;
    }

    // Creates a Iframe element
    createAmznIframe(adId) {
        let iFrame = document.createElement("iframe");
        iFrame.style.width = "auto";
        iFrame.style.height = "164px";
        iFrame.style.transform = "rotateY(180deg) scaleY(1.2)";
        iFrame.style.border = "0";
        iFrame.src = "//ws-eu.amazon-adsystem.com/widgets/q?ServiceVersion=20070822&OneJS=1&Operation=GetAdHtml&MarketPlace=DE&source=ac&ref=tf_til&ad_type=product_link&tracking_id="+ this.partnerId + "&marketplace=amazon&region=DE&placement="+ adId +"&asins="+ adId +"&linkId=076baa6f59ed86500d03962249018761&show_border=false&link_opens_in_new_window=true&price_color=333333&title_color=0066c0&bg_color=ffffff";
        iFrame.onclick = () => {
            window.open(product.link, '_blank');
        };
        return iFrame;
    }
}