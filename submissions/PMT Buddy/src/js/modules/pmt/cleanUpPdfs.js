"use strict";

export const pmt_CleanUpPdfs = () => {
    const link = document.getElementsByTagName("iframe")[0]?.src;

    if (!link) return
    if (!/.*\.pdf/.test(link)) return
    window.location.href = link;
}