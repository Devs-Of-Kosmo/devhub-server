package team.devs.devhub.domain.board.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import team.devs.devhub.domain.board.domain.Board;

@Getter
@Builder
@AllArgsConstructor
public class BoardResponse {

    private Long id;
    private String title;
    private String content;
    private String writer;
    private String imagePath;

    public BoardResponse() {

    }

    public static BoardResponse of(Board board) {
        return BoardResponse.builder()
                .id(board.getId())
                .title(board.getTitle())
                .content(board.getContent())
                .writer(String.valueOf(board.getWriter()))
                .imagePath(board.getImagePath())
                .build();
    }
}
