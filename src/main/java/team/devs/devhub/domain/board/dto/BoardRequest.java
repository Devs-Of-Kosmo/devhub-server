package team.devs.devhub.domain.board.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;
import team.devs.devhub.domain.board.domain.Board;
import team.devs.devhub.domain.user.domain.User;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class BoardRequest {

    @NotBlank
    private String title;
    @NotBlank
    private String content;
    private MultipartFile file;

    public Board toEntity(User writer, String imagePath) {
        return Board.builder()
                .writer(writer)
                .title(title)
                .content(content)
                .imagePath(imagePath)
                .build();
    }
}
