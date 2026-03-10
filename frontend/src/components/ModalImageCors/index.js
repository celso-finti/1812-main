import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";

import ModalImage from "react-modal-image";
import api from "../../services/api";

const useStyles = makeStyles(theme => ({
	messageMedia: {
		objectFit: "cover",
		width: 250,
		height: "auto", // Redimensionar automaticamente a altura para manter a proporção
		borderTopLeftRadius: 8,
		borderTopRightRadius: 8,
		borderBottomLeftRadius: 8,
		borderBottomRightRadius: 8,
	}
}));

const ModalImageCors = ({ imageUrl }) => {
	const classes = useStyles();
	const [fetching, setFetching] = useState(true);
	const [blobUrl, setBlobUrl] = useState("");

	useEffect(() => {
		if (!imageUrl) return;
		const fetchImage = async () => {
			try {
				// ✅ CORRIGIDO: O imageUrl já vem do backend com a URL completa (incluindo BACKEND_URL)
				// O modelo Message constrói: ${BACKEND_URL}/public/company${companyId}/flow/${fileName}
				// Então precisamos extrair apenas o caminho relativo para usar com api.get()
				let normalizedUrl = imageUrl;
				
				if (normalizedUrl.startsWith('http://') || normalizedUrl.startsWith('https://')) {
					// Se já é uma URL completa, extrair apenas o caminho relativo
					try {
						const urlObj = new URL(normalizedUrl);
						normalizedUrl = urlObj.pathname; // Pega apenas o caminho (ex: /public/company1/flow/logo-swl-plus.png)
					} catch (e) {
						// Se falhar ao parsear, usar como está
						console.warn("[ModalImageCors] Erro ao parsear URL:", e);
					}
				} else if (!normalizedUrl.startsWith('/')) {
					// Se não começa com /, adicionar
					normalizedUrl = `/${normalizedUrl}`;
				}
				
				// Agora normalizedUrl está no formato: /public/company1/flow/logo-swl-plus.png
				// O api.get() vai fazer: baseURL + normalizedUrl = BACKEND_URL + /public/company1/flow/logo-swl-plus.png
				
				const { data, headers } = await api.get(normalizedUrl, {
					responseType: "blob",
				});
				const url = window.URL.createObjectURL(
					new Blob([data], { type: headers["content-type"] })
				);
				setBlobUrl(url);
				setFetching(false);
			} catch (error) {
				console.error("[ModalImageCors] Erro ao carregar imagem:", error);
				console.error("[ModalImageCors] URL tentada:", imageUrl);
				setFetching(false);
			}
		};
		fetchImage();
	}, [imageUrl]);

	return (
		<ModalImage
			className={classes.messageMedia}
			smallSrcSet={fetching ? imageUrl : blobUrl}
			medium={fetching ? imageUrl : blobUrl}
			large={fetching ? imageUrl : blobUrl}
			alt="image"
			showRotate={true}
		/>
	);
};

export default ModalImageCors;
