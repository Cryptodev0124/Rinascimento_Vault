import React from "react";
import styles from "../styles/container/Container.module.scss";

const Footer = () => {
    return (
        <div className={styles.footer}>
            <section className={styles.footerContainer}>
                <a className={styles.dashboardText} href="https://t.me/XLabs_erc" target="_blank" rel="noreferrer">
                    <p>Telegram</p>
                </a>
                <a className={styles.dashboardText} href="https://twitter.com/XlabsBot" target="_blank" rel="noreferrer">
                    <p>Twitter</p>
                </a>
            </section>
        </div>
    );
};

export default Footer;
